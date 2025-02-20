import { Project } from 'ts-morph';

const project = new Project({});

// Agrega el archivo al proyecto
project.addSourceFileAtPath(
  './app/features/component-test/component-test.component.ts'
);

const componentTestFile = project.getSourceFile(
  './app/features/component-test/component-test.component.ts'
);

const klass = componentTestFile?.getClasses()[0];

const props = klass.getProperties().map((prop) => ({
  name: prop.getName(),
  type: prop.getType().getText().split('.')[1],
  content: prop
    .getText()
    .split('=')
    .slice(1)
    .join('=')
    .replaceAll('\n', '')
    .replaceAll('  ', ''),
}));

console.log(props);
