/**
 * Submission lifecycle hooks.
 * Auto-sets submittedAt timestamp on creation.
 */

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (!data.submittedAt) {
      data.submittedAt = new Date().toISOString();
    }
  },
};
