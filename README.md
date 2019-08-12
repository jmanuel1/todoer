# **todoer**: A [Mailspring](https://getmailspring.com) plugin

![A screenshot of the todoer plugin preferences](docs/screenshot.png)

Automatically add an email to your local
[todo.txt](https://github.com/todotxt/todo.txt) when you star it.

## What is it?

todoer is a Mailspring plugin that adds emails to your todo.txt whenever you
star them. The path to the todo file is configurable in a todoer tab under
Preferences (<kbd>Ctrl+Comma</kbd> on Windows). The plugin acts completely
locally--there's no sign-in to worry about! It even works with todo.txt files
that are synced over a cloud service.

## Development

Node 10.10+!

## Roadmap

1. Write up a README, including relevant details about Mailspring's APIs.
1. Turn services into Reflux stores. See
   https://foundry376.github.io/Mailspring/guides/Architecture.html.
2. Correct generated todos like
   `(undefined) 2019-08-04 Your ride with Duane on August 4 + @`
3. Prevent duplicate todos from being generated
4. Tag generated todos as being from the email context (`@email`)
5. Remove unstarred emails from todo.txt
