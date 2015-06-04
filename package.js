Package.describe({
  name: 'foobarbecue:navgraph',
  version: '0.0.3',
  summary: 'A website menu component built in d3',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/foobarbecue/navgraph',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('navgraph.js');
  api.use('d3js:d3@3.5.5');
  api.export('Navgraph','client');
});
