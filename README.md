# Boggl - a Toggl command line tool

Mostly made for bulk editing of time entries, specifically to clean up the result of merging multiple accounts into one.

Note: I made this because I had a problem to solve. If your problem differs, consider forking this and making a PR.

## Install

    npm i -g boggl

## Build from source

    npm i
    npx tsc
    node ./dist/cli

## Usage

    Usage: cli [options] [command]
    
    Options:
    -t, --token <value>      Toggl API token. TOGGL_TOKEN from environment used by default. (default: "50b68741adb4114220fd12ab7f96693e")
    -w, --workspace <value>  Workspace ID (required for everything but workspaces)
    -v, --verbose            Verbose output (repeat for more) (default: 0)
    -j, --json               Show as JSON
    -i, --ids                Show ID(s) only
    -h, --help               display help for command
    
    Commands:
    workspaces               List workspaces
    projects                 List projects
    entries [options]        List or edit time entries
    help [command]           display help for command

You need an API token which you can get in your Toggl profile settings. You can set it for the session with:

    export TOGGL_TOKEN=pollococodrilo

You can also set `TOGGL_WORKSPACE` to the workspace ID.

## Commands

### List workspaces

    node dist/cli.js workspaces

### List projects

    node dist/cli.js -w 123 projects

### Entry management

    Usage: cli entries [options]
    
    List or edit time entries
    
    Options:
    -q, --query <value>  Query string (without ?, workspace or dates (default: "")
    --since <value>      Start date (default: "2020-09-01")
    --until <value>      End date (default: "2021-09-01")
    --update <value>     Update (JSON object or query string) (default: "")
    -h, --help           display help for command

* See [Reports docs](https://github.com/toggl/toggl_api_docs/blob/master/reports.md) for possible query parameters.
* See [Time entries docs](https://github.com/toggl/toggl_api_docs/blob/master/chapters/time_entries.md) for updatable fields.
* Don't forget to single-quote query and update params in the command line, shells don't usually like `&` and `{`.
* Some fields expect non-string values for the update, then you *must* use JSON.

## Examples

Find all tasks by specific users + projects in the last 2 years:

    node dist/cli.js \
        -w 123 \
        -vvv \
        entries \
        --query 'project_ids=234,235&user_ids=356,357' \
        --since 2020-01-01

Make tasks found in previous call billable and move to a different project:

    node dist/cli.js \
        -w 123 \
        -vvv \
        entries \
        --query 'project_ids=234,235&user_ids=356,357' \
        --since 2020-01-01 \
        --update '{"pid":358,"billable":true}'

## License

MIT

