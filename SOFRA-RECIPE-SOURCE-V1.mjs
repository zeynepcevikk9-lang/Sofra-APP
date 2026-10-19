/** Strict provenance gate for recipe content and step media. */

const sourceTypes = new Set(['licensed_partner', 'public_domain', 'cc_by', 'editorial_owned']);
const licenses = new Set(['public_domain', 'cc_by', 'odc_by', 'licensed_partner']);
const mediaTypes = new Set(['image', 'video']);
const validText = (value) => typeof value === 'string' && value.trim() ? value.trim() : null;
const validHttps = (value) => typeof value === 'string' && /^https:\/\//.test(value);
const validDate = (value) => typeof value === 'string' && !Number.isNaN(new Date(value).getTime());

function validateIngredients(ingredients, errors) {
  if (!Array.isArray(ingredients) || !ingredients.length) {
    errors.push('ingredients_required');
    return [];
  }
  return ingredients.map((item, index) => {
    const canonicalName = validText(item?.canonical_name);
    const displayName = validText(item?.display_name) || canonicalName;
    const quantityValue = Number(item?.quantity_value);
    const unit = validText(item?.unit);
    if (!canonicalName) errors.push(`ingredient_${index}_canonical_name_required`);
    if (!Number.isFinite(quantityValue) || quantityValue <= 0) errors.push(`ingredient_${index}_quantity_required`);
    if (!unit) errors.push(`ingredient_${index}_unit_required`);
    return { canonical_name: canonicalName, display_name: displayName, quantity_value: quantityValue, unit };
  });
}

function validateMedia(media, errors) {
  if (media == null) return [];
  if (!Array.isArray(media)) {
    errors.push('media_must_be_array');
    return [];
  }
  return media.map((item, index) => {
    const assetId = validText(item?.asset_id);
    const type = validText(item?.type);
    const sourceUrl = validText(item?.source_url);
    const license = validText(item?.license);
    const attribution = validText(item?.attribution);
    if (!assetId) errors.push(`media_${index}_asset_id_required`);
    if (!type || !mediaTypes.has(type)) errors.push(`media_${index}_type_invalid`);
    if (!validHttps(sourceUrl)) errors.push(`media_${index}_https_source_required`);
    if (!license || !licenses.has(license)) errors.push(`media_${index}_license_invalid`);
    if (!attribution) errors.push(`media_${index}_attribution_required`);
    return { asset_id: assetId, type, source_url: sourceUrl, license, attribution };
  });
}

export function validateRecipeSourceRecord(input = {}) {
  const errors = [];
  const sourceId = validText(input.source_id);
  const sourceType = validText(input.source_type);
  const sourceUrl = validText(input.source_url);
  const attribution = validText(input.attribution);
  const license = validText(input.license);
  const licenseUrl = validText(input.license_url);
  const revisionId = validText(input.recipe_revision_id);
  const lastVerifiedAt = validText(input.last_verified_at);
  if (!sourceId) errors.push('source_id_required');
  if (!sourceType || !sourceTypes.has(sourceType)) errors.push('source_type_invalid');
  if (!validHttps(sourceUrl)) errors.push('https_source_required');
  if (!attribution) errors.push('attribution_required');
  if (!license || !licenses.has(license)) errors.push('license_invalid');
  if (license !== 'public_domain' && !validHttps(licenseUrl)) errors.push('license_url_required');
  if (!revisionId) errors.push('recipe_revision_id_required');
  if (!validDate(lastVerifiedAt)) errors.push('last_verified_at_required');
  const ingredients = validateIngredients(input.ingredients, errors);
  const media = validateMedia(input.media, errors);
  if (errors.length) return { schema_version: 1, status: 'rejected', errors, content_provenance: null };
  return {
    schema_version: 1,
    status: 'verified',
    errors: [],
    content_provenance: {
      source_id: sourceId,
      source_type: sourceType,
      source_url: sourceUrl,
      attribution,
      license,
      license_url: licenseUrl,
      recipe_revision_id: revisionId,
      last_verified_at: lastVerifiedAt,
      ingredients_status: 'source_bound',
      media_status: media.length ? 'source_bound' : 'not_bound',
      media,
    },
  };
}

export function recipeContentProvenance(recipe = {}) {
  const result = validateRecipeSourceRecord(recipe.content_source || {});
  return result.status === 'verified' ? result.content_provenance : null;
}
