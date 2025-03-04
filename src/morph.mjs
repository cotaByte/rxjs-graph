import { Project, SyntaxKind } from 'ts-morph';

const rxjsRegExp = {
  merge: { reg: /merge/ },
  mergeMap: {
    reg: /mergeMap/,
  },
  mergeWith: {
    reg: /mergeWith/,
  },
  switchMap: {
    reg: /switchMap/,
  },
  withLatestFrom: {
    reg: /withLatestFrom/,
  },
  combineLatest: {
    reg: /combineLatest/,
  },
  combineLatestWith: {
    reg: /combineLatestWith/,
  },
  forkJoin: {
    reg: /forkJoin/,
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
const rxjsPropsNames = rxjsProps.map((prop) => prop.getName());

console.log('Class RXJS declarations');
console.log('============================================');
console.log(rxjsPropsNames);
console.log('============================================');
console.log('                                            ');

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
printAllChildren(test);

//#region TS MOPRH APPROACH
function printAllChildren(node, depth = 0) {
  const nodeText = node.getText();
  const syntaxKindToSee = ['Identifier'];
  if (syntaxKindToSee.includes(node.getKindName())) {
    console.log('========================================================');
    console.log(' '.repeat(depth));

    console.log(
      `Node found at depth ${depth}: NodeType: ${syntaxKindToName(
        node.getKind()
      )}  => ${nodeText}`
    );
  }
  depth;

  node.getChildren().forEach((c) => printAllChildren(c, depth++));
}
function syntaxKindToName(kind) {
  return SyntaxKind[kind];
}

function isRxjsCombinatorDeclaration(node) {
  return Object.values(rxjsRegExp).some(({ reg }) => reg.test(node.getText()));
}

function isObservableDeclaration(node) {
  return rxjsPropsNames.some((prop) => node.getText().startsWith(prop));
}

function mayBeAObservable(node) {
  const creationOperators = [
    'ajax',
    'bindCallback',
    'bindNodeCallback',
    'defer',
    'empty',
    'from',
    'fromEvent',
    'fromEventPattern',
    'generate',
    'interval',
    'of',
    'range',
    'throwError',
    'timer',
    'iif',
  ];

  return creationOperators.some((op) => node.getText().startsWith(op));
}

function mayBeAObservableFromService(node) {
  //todo: must be a better way of do this
  return node
    .getText()
    .toString()
    .match(/^this\.[^.]*[sS]ervice\.[^.]*/gm);
}
//#endregion TS MOPRH APPROACH
