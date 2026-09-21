import { SaxesParser } from 'saxes';

// Strict XML validation and a small tree for inspecting generated plugin output.
export function parseXml(source) {
  const parser = new SaxesParser({xmlns:true});
  const stack = [];
  let root;
  parser.on('opentag', tag => {
    const node = {name:tag.name,uri:tag.uri,attributes:tag.attributes,text:'',children:[]};
    if (stack.length) stack.at(-1).children.push(node);
    else root = node;
    stack.push(node);
  });
  parser.on('text', text => { if (stack.length) stack.at(-1).text += text; });
  parser.on('cdata', text => { stack.at(-1).text += text; });
  parser.on('closetag', () => stack.pop());
  parser.write(source).close();
  return root;
}
export const children = (node, name) => node.children.filter(child => child.name === name);
export const child = (node, name) => children(node,name)[0];
