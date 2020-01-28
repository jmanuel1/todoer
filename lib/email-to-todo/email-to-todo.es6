import {
  merge,
  getTodosFrom,
  ensureFixed,
  EmailIDExtension
} from '../todo-txt/todo-txt';
import {
  promises as fs
} from 'fs';

export function toTodo(email) {
  let emailID;
  if (email.id === undefined) {
    emailID = undefined
  } else {
    emailID = email.id.replace(':', '_');
  }
  const todo = merge({}, {
    text: email.subject,
    date: email.date,
    extensions: [new EmailIDExtension()],
    'email/id': emailID,
    'email/idString': emailID
  });
  return todo;
}

export async function save(todo, filepath) {
  // Since we want to preserve how the original todos are written, we won't
  // parse them
  const contents = await fs.readFile(filepath, 'utf8');
  const newline = contents[contents.length - 1] === '\n' ? '' : '\n';
  const todoString = ensureFixed(todo).toString();
  await fs.writeFile(filepath, newline + todoString, { flag: 'a' });
}
