import {
  getTodosFrom,
  merge,
  writeTo
} from '../../lib/todo-txt/todo-txt';
import {
  TodoTxtItem
} from 'jstodotxt';
import * as path from 'path';
import * as os from 'os';
import {
  promises as fs
} from 'fs';

// for async/await
import 'babel-polyfill';

describe('getTodosFrom', function() {
  it('can get todos from a file', async function() {
    const todos = await getTodosFrom(path.join(__dirname,
      '../support/todo.txt'));
    expect(todos.length).toBeGreaterThan(0);
  });
});

describe('merge', function() {
  it('can update a todo in a pure way', function() {
    const todo = new TodoTxtItem('(A) get groceries @shopping');
    /* NOTE: jstodotxt expects a completion date on completed tasks. This
    /* *might* not be in line with the todo.txt spec (the spec is ambiguous). */
    const diff = new TodoTxtItem(
      'x 2019-07-30 get groceries from local store');
    const updatedTodo = merge(todo, diff);
    expect(updatedTodo.complete).toBeTruthy();
    expect(updatedTodo.priority).toBe('A');
    expect(updatedTodo.text).toBe('get groceries from local store');
    expect(updatedTodo.contexts).toEqual(['shopping']);
  });
});

describe('writeTo', function() {
  let todo;
  beforeEach(function() {
    todo = new TodoTxtItem(
      'write tests for @plugin +code +computer due:2019-07-30');
  });

  it('can write todos to a text file in todo.txt format', async function() {
    const dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    await writeTo(path.join(dirpath, 'todo.txt'), [todo]);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).toContain('write tests');
    expect(content).toContain('@plugin');
    expect(content).toContain('+code');
    expect(content).toContain('due:2019-07-30');
  });
  it('can write todos with undefined priority', async function() {
    todo.priority = undefined;
    const dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    await writeTo(path.join(dirpath, 'todo.txt'), [todo]);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).not.toContain('(undefined)');
  });
  it('can write todos with empty contexts arrays', async function() {
    todo.contexts = [];
    const dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    await writeTo(path.join(dirpath, 'todo.txt'), [todo]);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).not.toContain('@');
  });
  it('can write todos with empty projects arrays', async function() {
    todo.projects = [];
    const dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
    await writeTo(path.join(dirpath, 'todo.txt'), [todo]);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).not.toContain('+');
  });
});
