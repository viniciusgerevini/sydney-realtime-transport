const defaultFs = require('fs');

function load(env = process.env.APP_ENV, variables = process.env, fs = defaultFs) {
  const file = fs.readFileSync(`./configs/${env}.json`, 'utf8');
  return parseFile(file, variables);
}

function parseFile(fileContent, variables) {
  const file = JSON.parse(fileContent);
  if (Object.keys(variables).length > 0) {
    injectVariables(file, variables);
  }

  return file;
}

function injectVariables(file, variables) {
  Object.assign(file, getEnvironmentValues(file, variables));
}

function getEnvironmentValues(file, variables) {
  return Object.keys(file).reduce((values, property) => {
    const currentValue = file[property];

    if (typeof currentValue === 'object') {
      Object.assign(values, { [property]: getEnvironmentValues(currentValue, variables) });
    } else if (shouldReplace(currentValue)) {
      Object.assign(values, { [property]: getValueForProperty(currentValue, variables) });
    }

    return values;
  }, {});
}

function shouldReplace(value) {
  return (/\{\{.+\}\}/).test(value);
}

function getValueForProperty(property, variables) {
  return variables[property.replace(/[{|}]/g, '')] || '';
}

module.exports = { load };
