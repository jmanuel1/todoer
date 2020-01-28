import {
  TodoTxt,
  TodoTxtItem
} from 'jstodotxt';
import { TodoTxtExtension } from 'jstodotxt/jsTodoExtensions';
import {
  promises as fs
} from 'fs';

global.TodoTxtExtension = TodoTxtExtension;

export class EmailIDExtension extends TodoTxtExtension {
  constructor() {
    super();
    this.name = 'email/id';
    this.parsingFunction = function(line) {
      console.log(line);
      const regex = /\bemail\/id:(\S+)\b/;
      const match = regex.exec(line);
      if (match === null) {
        console.log('no match');
        return [null, null, null];
      }
      return [match[1], line.replace(regex, ''), match[1]];
    }
  }
}

export async function getTodosFrom(filename) {
  const contents = await fs.readFile(filename, 'utf8');
  const emailIDExtension = new EmailIDExtension();
  const todos = [];
  for (let line of contents.split('\n')) {
    if (line === '') continue;
    const newTodo = new TodoTxtItem(line, [emailIDExtension]);
    todos.push(newTodo);
  }
  return todos;
}

export function merge(todo, partialTodo) {
  const newTodo = new TodoTxtItem();

  replace(newTodo, todo, partialTodo, 'text');
  replace(newTodo, todo, partialTodo, 'priority');
  replace(newTodo, todo, partialTodo, 'complete');
  replace(newTodo, todo, partialTodo, 'completed');
  replace(newTodo, todo, partialTodo, 'date');
  replace(newTodo, todo, partialTodo, 'email/id');
  replace(newTodo, todo, partialTodo, 'email/idString');
  // add contexts
  newTodo.contexts = combine(todo, partialTodo, 'contexts');
  // add projects
  newTodo.projects = combine(todo, partialTodo, 'projects');
  // add extensions
  newTodo.extensions = combine(todo, partialTodo, 'extensions');

  return newTodo;
}

function combine(original, source, property) {
  return (original[property] || []).concat(source[property] || []);
}

function replace(destination, original, source, property) {
  if (source.hasOwnProperty(property) && !([null, undefined].includes(source[
      property]))) {
    destination[property] = source[property];
    return;
  }
  destination[property] = original[property];
}

export function ensureFixed(todo) {
  todo = merge(todo, {}); // copy todo
  if (todo.priority === undefined) {
    todo.priority = null;
  }
  if (todo.contexts !== null && todo.contexts.length === 0) {
    todo.contexts = null;
  }
  if (todo.projects !== null && todo.projects.length === 0) {
    todo.projects = null;
  }
  return todo;
}

export async function writeTo(filename, todos) {
  const fixedTodos = todos.map(ensureFixed);
  const content = TodoTxt.render(fixedTodos);
  return await fs.writeFile(filename, content);
}
