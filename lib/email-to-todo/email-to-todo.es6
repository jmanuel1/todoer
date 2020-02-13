import {
  merge,
  getTodosFrom,
  ensureFixed,
  parseTodoString,
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
    'email/idString': emailID,
    contexts: ['email']
  });
  return todo;
}

export async function save(todo, filepath) {
  const previousTodos = await getTodosFrom(filepath);
  const emailIDs = previousTodos.map(todo => todo['email/id']).filter(id =>
    id !== undefined);
  if (emailIDs.includes(todo['email/id'])) {
    return;
  }

  const contents = await fs.readFile(filepath, 'utf8');
  const newline = contents[contents.length - 1] === '\n' ? '' : '\n';
  const todoString = ensureFixed(todo).toString();
  // Since we want to preserve how the original todos are written, we append to
  // the file
  await fs.writeFile(filepath, newline + todoString, {
    flag: 'a'
  });
}

// this might nuke the file if someone clicks fast enough
// I couldn't reproduce it, so I'm not sure
export async function remove(id, filepath) {
  const contents = await fs.readFile(filepath, 'utf8');
  const lines = contents.split('\n');
  const editedLines = lines.filter(line => {
    if (line === '') {
      return false;
    }
    const todo = parseTodoString(line);
    return todo['email/id'] !== id.replace(':', '_');
  });
  await fs.writeFile(filepath, editedLines.join('\n'));
}
