import {
  toTodo,
  save
} from '../../lib/email-to-todo/email-to-todo';
import {
  merge,
  EmailIDExtension
} from '../../lib/todo-txt/todo-txt';
import * as path from 'path';
import * as os from 'os';
import {
  promises as fs
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
});

describe('save', function() {
  it('can save a todo to a file while preserving other todos', async function() {
    const todoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    const todoPath = path.join(todoDir, 'todo.txt');
    const original = 'some todo +project\n';
    await fs.writeFile(todoPath, original);
    const newTodo = merge({}, { text: 'another item', projects: ['second'] });
    await save(newTodo, todoPath);
    const newContents = await fs.readFile(todoPath, 'utf8');
    expect(newContents).toContain('some todo');
    expect(newContents).toContain('another item');
  });
  // If text, contexts, and projects were mixed up in the original todos, we
  // should preserve their order
  it('preserves the order in which previous todos were written', async function() {
    const todoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    const todoPath = path.join(todoDir, 'todo.txt');
    const original = 'x 2020-01-18 2020-01-15 +homework 0 +cse310 due:2020-01-19 @school\n';
    await fs.writeFile(todoPath, original);
    const newTodo = merge({}, { text: 'another item', projects: ['second'] });
    await save(newTodo, todoPath);
    const newContents = await fs.readFile(todoPath, 'utf8');
    expect(newContents).toContain('+homework 0');
    expect(newContents).toContain('another item');
  });
});
