import { Project, SyntaxKind } from 'ts-morph';

const rxjsRegExp = {
  merge: { reg: /merge\(/, extract: (node) => extractSourcesFormMerge(node) },
  mergeMap: {
    reg: /mergeMap\(/,
    extract: (node) => extractSourcesFromMergeMap(node),
  },
  mergeWith: {
    reg: /mergeWith\(/,
    extract: (node) => extractSourcesFromMergeWith(node),
  },
  switchMap: {
    reg: /switchMap\(/,
    extract: (node) => extractSourcesFromSwitchMap(node),
  },
  withLatestFrom: {
    reg: /withLatestFrom\(/,
    extract: (node) => extractSourcesFromwithLatestFrom(node),
  },
  combineLatest: {
    reg: /combineLatest\(/,
    extract: (node) => extractSourcesFromCombineLatest(node),
  },
  combineLatestWith: {
    reg: /combineLatestWith\(/,
    extract: (node) => extractSourcesFromCombineLatestWith(node),
  },
  forkJoin: {
    reg: /forkJoin\(/,
    extract: (node) => extractSourcesFromForkJoin(node),
  },
};

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

const test = metaProps[15].prop.getChildren()[2];

//regexp approach
// getCombinationSourcesDeclarations(test);

printAllChildren(test);

//#region regexp approach
function getCombinationSourcesDeclarations(node, depth = 0) {
  /**
   * Regexp for rxjs combinatory operators
   */

  if (
    node.getKindName() === 'CallExpression' &&
    Object.values(rxjsRegExp).some(({ reg }) => reg.test(node.getText()))
  ) {
    console.log('========================================================');
    const matchedCombination = Object.entries(rxjsRegExp).find(([key]) =>
      rxjsRegExp[key].reg.test(node.getText())
    );

    const sources = matchedCombination[1].extract(node.getText());

    console.log(
      `Founded ${
        matchedCombination[0]
      } at depth ${depth} ==> ${node.getKindName()}`
    );
    console.log(`Sources: [${sources}]`);
    console.log('========================================================\n');
  }

  node.forEachChild((child) => {
    getCombinationSourcesDeclarations(child, depth + 1);
  });
}

//#region EXTRACT SOURCES
function extractSourcesFromMergeMap(string) {
  const regexp = /mergeMap\(\s*([\s\S]*?)\s*\)/;
  const match = string.match(regexp);

  return match ? extractSources(match) : [];
}

function extractSourcesFromSwitchMap(string) {
  const regexp = /switchMap\(\s*([\s\S]*?)\s*\)/;
  const match = string.match(regexp);

  return match ? extractSources(match) : [];
}

function extractSourcesFromForkJoin(string) {
  const regexp = /forkJoin\(\[\s*([\s\S]*?)\s*\]\)/;
  const match = string.match(regexp);

  return match ? extractSources(match) : [];
}

function extractSourcesFromCombineLatest(string) {
  const regexp = /combineLatest\(\[\s*([\s\S]*?)\s*\]\)/;
  const match = string.match(regexp);

  return match ? extractSources(match) : [];
}

function extractSourcesFromMergeWith(string) {
  const regexp = /mergeWith\(\s*([\s\S]*?)\s*\)/;
  const match = string.match(regexp);

  return match ? extractSources(match) : [];
}

function extractSourcesFromCombineLatestWith(string) {
  const regexp = /combineLatestWith\(\s*([\s\S]*?)\s*\)/;
  const match = string.match(regexp);

  return match ? extractSources(match) : [];
}

function extractSourcesFromwithLatestFrom(string) {
  const regexp = /withLatestFrom\(\s*([\s\S]*?)\s*\)/;
  const match = string.match(regexp);

  return match ? extractSources(match) : [];
}

function extractSourcesFormMerge(string) {
  const regexp = /merge\(\s*([\s\S]*?)\s*\)/;
  const match = string.match(regexp);

  return match ? extractSources(match) : [];
}
//#endregion EXTRACT SOURCES

function extractSources(match) {
  const regexp = /this\.\$?(\w+\$?)/g;
  const sources = [];
  let source;
  while ((source = regexp.exec(match[1])) !== null) {
    sources.push(source[1]);
  }
  return sources;
}

//#endregion regexp approach

//#region TS MOPRH APPROACH
function printAllChildren(node, depth = 0) {
  if (!syntaxKindToName(node.getKind()) === 'CallExpression') return;

  const nodeText = node.getText();
  const hasRxjsProp = rxjsProps.some((prop) =>
    nodeText.includes(prop.getName())
  );

  if (!hasRxjsProp) return;

  console.log(nodeText);

  depth++;
  node.getChildren().forEach((c) => printAllChildren(c, depth));
}
function syntaxKindToName(kind) {
  return SyntaxKind[kind];
}
//#endregion TS MOPRH APPROACH
