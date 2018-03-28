const gulp = require('gulp');
const CrowdinApi = require('crowdin-api');

gulp.task('crowdin', () => {
  if(process.env.CROWDIN_API_KEY && process.env.CROWDIN_PROJECT) {
    const api = new CrowdinApi({apiKey: process.env.CROWDIN_API_KEY});
    const files = {
      'English-en_US.json': './src/locale/English-en_US.json'
    };
    return api.updateFile(process.env.CROWDIN_PROJECT, files).then(function(result) {
      if(result.success) {
        console.log('Crowdin upload succeeded', result.files);
      } else {
        console.log(result);
      }
    }).catch(function(err) {
      console.log('Crowdin error', err);
    });
  } else {
    console.log('Missing Crowdin environment vars. Skipping locale upload.');
  }
});
