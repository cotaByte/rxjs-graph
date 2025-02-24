import { Project, SourceFile, SyntaxKind } from 'ts-morph';

const project = new Project({});
project.addSourceFilesAtPaths('../src/**/*.ts');

const componentTestFile = project.getSourceFile(
  './app/features/component-test/hardcore-test.component.ts'
);

const klass = componentTestFile?.getClasses()[0];

const rxjsProps = klass.getProperties().filter((prop) =>
  prop
    .getType()
    .getText()
    .match(/\/node_modules\/rxjs\//)
);

const metaProps = rxjsProps
  .filter((prop) => prop.getType().getText().includes('rxjs'))
  .map((prop) => ({
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
    prop,
  }));

// console.log(metaProps.map((prop) => prop.name));

const test = metaProps[15].prop;

const leftItemOperator = test.getChildren()[2];

console.dir(leftItemOperator, { depth: null, colors: true });
