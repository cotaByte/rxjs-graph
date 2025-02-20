import { Project } from 'ts-morph';

const project = new Project({});
project.addSourceFilesAtPaths('../src/**/*.ts');

const componentTestFile = project.getSourceFile(
  './app/features/hardcore-component-test/hardcore-component-test.component.ts'
);

const klass = componentTestFile?.getClasses()[0];
console.log(klass.getProperties().map((prop) => prop.getName()));

const props = klass.getProperties().map((prop) => ({
  name: prop.getName(),
  type: prop.getType().getText().split('.')[1],
  linesContent: prop
    .getText()
    .trim()
    .split('=')
    .slice(1)
    .join('')
    .replaceAll('  ', '')
    .split('\n'),
}));

console.log(props);
