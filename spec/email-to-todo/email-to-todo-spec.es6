import {
  toTodo,
  save,
  remove,
  backup
} from '../../lib/email-to-todo/email-to-todo';
import {
  merge,
  EmailIDExtension
} from '../../lib/todo-txt/todo-txt';
import * as path from 'path';
import * as os from 'os';
import {
  promises as fs,
  existsSync
} from 'fs';

import 'babel-polyfill';

describe('toTodo', function() {
  let todo;
  beforeEach(function() {
    todo = toTodo({
      subject: 'test',
      date: '2019-07-30',
      id: '42'
    });
  });
  it('can create a todo object from an email', function() {
    expect(todo.text).toEqual('test');
    expect(todo.date).toEqual('2019-07-30');
  });
  it('can include an id inside the todo object', function() {
    expect(todo['email/id']).toEqual('42');
  });
  it(
    'includes the id extension and extension string inside the todo object',
    function() {
      expect(todo.extensions[0].constructor).toBe(EmailIDExtension);
      expect(todo['email/idString']).toBe('42');
    });
  it('replaces any colon in the id with an underscore', function() {
    todo = toTodo({ id: 't:42' });
    expect(todo['email/id']).toBe('t_42');
  });
  it('tags todos with the @email context', function() {
    expect(todo.contexts).toContain('email');
  });
});

describe('save', function() {
  let todoDir, todoPath;
  beforeEach(async function() {
    todoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    todoPath = path.join(todoDir, 'todo.txt');
  });
  it('can save a todo to a file and presere other todos', async function() {
    const original = 'some todo +project\n';
    await fs.writeFile(todoPath, original);
    const newTodo = merge({}, {
      text: 'another item',
      projects: ['second']
    });
    await save(newTodo, todoPath);
    const newContents = await fs.readFile(todoPath, 'utf8');
    expect(newContents).toContain('some todo');
    expect(newContents).toContain('another item');
  });
  // If text, contexts, and projects were mixed up in the original todos, we
  // should preserve their order
  it('preserves order in which previous todos were written', async function() {
    const original =
      'x 2020-01-18 2020-01-15 +homework 0 +cse310 due:2020-01-19 @school\n';
    await fs.writeFile(todoPath, original);
    const newTodo = merge({}, {
      text: 'another item',
      projects: ['second']
    });
    await save(newTodo, todoPath);
    const newContents = await fs.readFile(todoPath, 'utf8');
    expect(newContents).toContain('+homework 0');
    expect(newContents).toContain('another item');
  });
  // never duplicate the same email ID
  it('never writes a todo with a duplicate email/id', async function() {
    const original =
      'x 2020-01-18 2020-01-15 +homework 0 +cse310 due:2020-01-19 email/id:1\n';
    await fs.writeFile(todoPath, original);
    const newTodo = merge({}, {
      text: 'another item',
      projects: ['second'],
      'email/id': '1',
      'email/idString': '1',
      extensions: [new EmailIDExtension()]
    });
    await save(newTodo, todoPath);
    const newContents = await fs.readFile(todoPath, 'utf8');
    expect(newContents).not.toContain('another item');
  });
});

describe('remove', function() {
  let todoDir, todoPath;
  beforeEach(async function() {
    todoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    todoPath = path.join(todoDir, 'todo.txt');
  });
  it('deletes the todo with the given email/id from the given file', async function() {
    const original =
      'x 2020-01-18 2020-01-15 +homework 0 +cse310 due:2020-01-19 email/id:1\n';
    await fs.writeFile(todoPath, original);
    await remove('1', todoPath);
    const newContents = await fs.readFile(todoPath, 'utf8');
    expect(newContents.trim()).toBe('');
  });
  it('deletes a todo with an email/id containing a :', async function() {
    const original =
      'x 2020-01-18 2020-01-15 +homework 0 +cse310 due:2020-01-19 email/id:t_1\n';
    await fs.writeFile(todoPath, original);
    await remove('t:1', todoPath);
    const newContents = await fs.readFile(todoPath, 'utf8');
    expect(newContents.trim()).toBe('');
  });
});

describe('backup', function () {
  let todoDir, todoPath, backupPath, original;
  beforeEach(async function() {
    todoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    todoPath = path.join(todoDir, 'todo.txt');
    backupPath = todoPath + '.bk';
    original =
      'x 2020-01-18 2020-01-15 +homework 0 +cse310 due:2020-01-19 email/id:t_1\n';
    await fs.writeFile(todoPath, original);
    await backup(todoPath, backupPath);
  });
  it('creates a backup file', function () {
    const exists = existsSync(backupPath);
    expect(exists).toBeTruthy();
  });
  it('copies the original todos to the backup file', async function () {
    const contents = await fs.readFile(backupPath, 'utf8');
    expect(contents).toBe(original);
  });
})
