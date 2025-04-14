Creates, signs, and serves floppy PNG based web sites


Example use of create and web_deal:

create(site,domain,backup,emoji)  
site is an object that holds web content  
domain is the website domain  
backup is the path to a back folder  
emoji is the emoji for the website title


```javascript
Deno.serve({
  port: 3052,
  hostname: "127.0.0.1",
  handler: (req) => web_deal(req,domain),
});
```


