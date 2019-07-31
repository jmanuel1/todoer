import { toTodo, save } from '../../lib/email-to-todo/email-to-todo';
import { merge } from '../../lib/todo-txt/todo-txt';
import * as path from 'path';
import * as os from 'os';
import { promises as fs } from 'fs';

import 'babel-polyfill';

describe('toTodo', function() {
  it('can create a todo object from an email', function() {
    const todo = toTodo({ subject: 'test', date: '2019-07-30' });
    expect(todo.text).toEqual('test');
    expect(todo.date).toEqual('2019-07-30');
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
});