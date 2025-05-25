Creates, signs, and serves floppy PNG based web sites


Example use of create and web_deal:

create(site,backup)  
site is an object that holds web content  
backup is the path to a back folder  

Metadata is stored in assets/metadata.json.  Example:

```json
{
    "adaptiveanalysis.org": {
      "title": "Logical Map How-to Guide",
      "description":"Documents the quickest and most effective methods to create a logical map combining material and data flow with just three symbol classes and two types"
    }
}

```

```javascript
Deno.serve({
  port: 3052,
  hostname: "127.0.0.1",
  handler: (req) => web_deal(req),
});
```


