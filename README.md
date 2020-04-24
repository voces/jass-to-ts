# jass-to-ts
Converts JASS into TypeScript. Available online at https://voces.github.io/jass-to-ts/

Generated code should mostly be valid, though will require manual cleanup to
fix nulled handles. In most cases this means you can just delete the offending
line. More on this below.

## Running
You can install and run this as a global module:

```
npm i -g jass-to-ts
jass-to-ts path/to/war3map.j > war3map.ts
```

## Clean up
The generated TypeScript will be mostly valid with one exception: nullability.
By default, jass-to-ts treats types as non-nullable, so when you set a unit
variable to null, TypeScript will complain.

Here is an example. Given the following JASS:

```jass
function my_func takes nothing returns nothing
    local unit u = CreateUnit(Player(0), 'hfoo', 0, 0, 0)
    call RemoveUnit(u)
    set u = null
endfunction
```

jass-to-ts generates the following TypeScript:

```typescript
const my_func = (): void => {

	let u = CreateUnit( Player( 0 ), FourCC( "hfoo" ), 0, 0, 0 );
	RemoveUnit( u )
	u = null;

};
```

The type information of `u` is `unit`, which is incompatible with `null`. In
this case we were just trying to clean up a local leak, which doesn't occur
in TypeScript/Lua, so the line can just be deleted.

### Code blocks
If you're using `war3-types`, you may also find `null` issues in some function
calls. For example:

```typescript
TimerStart( myTimer, 15, false, null );
```

The fourth argument, `handlerFunc`, expects a function, but we passed `null`.
Here you'll want to pass an empty function, such as
`() => { /* does nothing */ }`.
