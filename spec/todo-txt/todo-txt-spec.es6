import {
  ensureFixed,
  getTodosFrom,
  merge,
  writeTo,
  EmailIDExtension
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

async function writeToTemp(todo) {
  const dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'todoer-'));
  await writeTo(path.join(dirpath, 'todo.txt'), [todo]);
  return dirpath;
}

describe('getTodosFrom', function() {
  it('can get todos from a file', async function() {
    const todos = await getTodosFrom(path.join(__dirname,
      '../support/todo.txt'));
    expect(todos.length).toBeGreaterThan(0);
  });
  it('can read email/id values from todos from a file', async function() {
    const todos = await getTodosFrom(path.join(__dirname,
      '../support/todo.txt'));
    console.log(todos[0]);
    expect(todos[0]['email/id']).toEqual('34f34fD3D3');
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
  it('can merge todos with email IDs', function() {
    const todo = new TodoTxtItem(
      '(A) get groceries @shopping email/id:42t34g', [new EmailIDExtension()]
    );
    const diff = new TodoTxtItem(
      'x 2019-07-30 get groceries from local store email/id:45y445',
      [new EmailIDExtension()]);
    const updatedTodo = merge(todo, diff);
    expect(updatedTodo['email/id']).toEqual('45y445');
  });
});

describe('writeTo', function() {
  let todo;
  beforeEach(function() {
    todo = new TodoTxtItem(
      'write tests @plugin +code +computer due:2019-07-30 email/id:4645t445',
      [new EmailIDExtension()]);
  });

  it('can write todos to a text file in todo.txt format', async function() {
    const dirpath = await writeToTemp(todo);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).toContain('write tests');
    expect(content).toContain('@plugin');
    expect(content).toContain('+code');
    expect(content).toContain('due:2019-07-30');
  });
  it('can write todos with undefined priority', async function() {
    todo.priority = undefined;
    const dirpath = await writeToTemp(todo);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).not.toContain('(undefined)');
  });
  it('can write todos with empty contexts arrays', async function() {
    todo.contexts = [];
    const dirpath = await writeToTemp(todo);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).not.toContain('@');
  });
  it('can write todos with empty projects arrays', async function() {
    todo.projects = [];
    const dirpath = await writeToTemp(todo);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).not.toContain('+');
  });
  it('can write todos with email IDs', async function() {
    const dirpath = await writeToTemp(todo);
    const content = await fs.readFile(path.join(dirpath, 'todo.txt'),
      'utf8');
    expect(content).toContain('email/id:4645t445');
  });
});

describe('ensureFixed', function () {
  let todo;
  beforeEach(function () {
    todo = new TodoTxtItem(
      'placeholder',
      [new EmailIDExtension()]);
  });
  it('escapes "@" in the text that can be read as contexts when read back', function () {
    todo.text = 'Google Chat (Jason Manuel) @ Mon May 11, 2020';
    todo = ensureFixed(todo);
    expect(todo.text).toEqual('Google Chat (Jason Manuel) \\@ Mon May 11, 2020');
  });
  it('escapes "+" in the text that can be read as projects when read back', function () {
    todo.text = 'haha + go escape';
    todo = ensureFixed(todo);
    expect(todo.text).toEqual('haha \\+ go escape');
  });
  it('does not escape "@" that will not read back as contexts', function () {
    todo.text = 'Tech Interview Prep Call @ Thu Aug 29, 2019 (jama.indo@hotmail.com)';
    todo = ensureFixed(todo);
    expect(todo.text).toEqual('Tech Interview Prep Call \\@ Thu Aug 29, 2019 (jama.indo@hotmail.com)');
  });
  it('preserves the whitespace before an escaped "@"', function () {
    todo.text = 'Luminosity Academy \t \t @ Weekly from 2pm to 3pm on Wednesday, Friday from Wed Aug 28 to Fri Dec 6 (MST) (example@sample.edu)';
    todo = ensureFixed(todo);
    expect(todo.text).toEqual('Luminosity Academy \t \t \\@ Weekly from 2pm to 3pm on Wednesday, Friday from Wed Aug 28 to Fri Dec 6 (MST) (example@sample.edu)');
  });
});
