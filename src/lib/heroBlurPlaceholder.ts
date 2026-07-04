// Blur-up placeholder for the home page's hero image (public/Images/front/clinic.jpg),
// the site's LCP-critical image. Hardcoded rather than generated: this is the only
// image on the site that ever uses a blur placeholder, so a build-time scanning
// script + generic lookup map would be one file, one script, and one abstraction
// layer more than a single constant needs. Regenerate by running (one-off, in a
// scratch script) `sharp('public/Images/front/clinic.jpg').resize(10, 10, { fit: 'inside' }).blur().jpeg({ quality: 50 }).toBuffer()`
// and base64-encoding the result, if clinic.jpg is ever replaced.
export const heroBlurPlaceholder =
    'data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAHAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMF/8QAHRAAAgIBBQAAAAAAAAAAAAAAAAECAwUEESIzkf/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAXEQADAQAAAAAAAAAAAAAAAAAAAQIx/9oADAMBAAIRAxEAPwCbyUbNO5KvmZ7ydu/TH0AYbnGFJVp//9k=';
