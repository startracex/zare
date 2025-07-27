---
title: Modules In Zare
slug: modules-in-zare
sidebar_position: 1
---
## Overview

To perform actions on string, numbers and dates like trimming a string, removing digits after decimal or getting the year from timestamp user has to build functions that can do this work for them but for vary small task we don’t want to waste your time that’s why Zare comes with the built in functions and this functions are stored in modules like `string`, `number`, `date` and `math`. With the growing community the more modules will be added in the future releases.

To use this modules and there related built-in functions you have to import those modules first.

## Example

```zare
use string
```

The above line will include the all string replated functions like `@lower()`, `@upper()`, `@trim()` and more.

### String Module

```zare
use string

serve (
    <h1>@lower(username)</h1>
)
```

### Number Module

```zare
use number

serve (
    <h1>@toFixed(20.49883, 2)</h1>
)
```

### Math Module

```zare
use math

serve (
    <h1>@pow(2, 2)</h1>
)
```

### Date Module

```zare
use date

serve (
    <h1>@getFullYear("2025-5-1")</h1>
)
```
