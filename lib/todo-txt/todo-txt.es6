import {
  TodoTxt,
  TodoTxtItem
} from 'jstodotxt';
import {
  promises as fs
} from 'fs';

export async function getTodosFrom(filename) {
  const contents = await fs.readFile(filename, 'utf8');
  return TodoTxt.parse(contents);
}

export function merge(todo, partialTodo) {
  const newTodo = new TodoTxtItem();

  replace(newTodo, todo, partialTodo, 'text');
  replace(newTodo, todo, partialTodo, 'priority');
  replace(newTodo, todo, partialTodo, 'complete');
  replace(newTodo, todo, partialTodo, 'completed');
  replace(newTodo, todo, partialTodo, 'date');
  // add contexts
  newTodo.contexts = (todo.contexts || []).concat(partialTodo.contexts || []);
  // add projects
  newTodo.projects = (todo.projects || []).concat(partialTodo.projects || []);

  return newTodo;
}

function replace(destination, original, source, property) {
  if (source.hasOwnProperty(property) && !([null, undefined].includes(source[
      property]))) {
    destination[property] = source[property];
    return;
  }
  destination[property] = original[property];
}

export async function writeTo(filename, todos) {
  const content = TodoTxt.render(todos);
  return await fs.writeFile(filename, content);
}