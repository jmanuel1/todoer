import {
  merge,
  getTodosFrom,
  ensureFixed,
  parseTodoString,
  EmailIDExtension
} from '../todo-txt/todo-txt';
import debug from '../dev/debug';
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
  // These many debug calls are here so that I can keep track of the function's
  // progress.
  debug('reading existing todos');
  const previousTodos = await getTodosFrom(filepath);
  debug('grabbing all thread IDs');
  const emailIDs = previousTodos.map(todo => todo['email/id']).filter(id =>
    id !== undefined);
  debug('checking for presence of this thread');
  if (emailIDs.includes(todo['email/id'])) {
    debug('thread already present');
    return;
  }

  debug('reading entire todo.txt');
  const contents = await fs.readFile(filepath, 'utf8');
  debug('checking if todo.txt ends with newline');
  const newline = contents[contents.length - 1] === '\n' ? '' : '\n';
  debug('stringifying the todo');
  const todoString = ensureFixed(todo).toString();
  debug('appending the todo to the todo.txt');
  // Since we want to preserve how the original todos are written, we append to
  // the file
  // TODO: Sometimes the following line just doesn't finish and I'm not sure
  // why. I should put a timeout on it and notify the user that the operation
  // failed until I can figure out what's going on.
  await fs.writeFile(filepath, newline + todoString, {
    flag: 'a'
  });
  debug('save finished');
}

// this might nuke the file if someone clicks fast enough
// I couldn't reproduce it, so I'm not sure
export async function remove(id, filepath) {
  const contents = await fs.readFile(filepath, 'utf8');
  const lines = contents.split('\n');
  const editedLines = lines.filter(line => {
    let todo;
    try {
      todo = parseTodoString(line);
    } catch (error) {
      if (error.message === 'Empty Task') {
        return false;
      }
      debug(error);
      return true;
    }
    return todo['email/id'] !== id.replace(':', '_');
  });
  await fs.writeFile(filepath, editedLines.join('\n'));
}

export async function backup(originalPath, backupPath) {
  await fs.copyFile(originalPath, backupPath);
}
