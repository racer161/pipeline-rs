extern crate serde_json;
extern crate ws;

use ws::{listen, Handler, Sender, Message, CloseCode};
use serde_json::{Value};
use std::io;
use std::result::Result;
use std::path::Path;

mod file_manager;

pub fn handle_message(message : String) -> Result<Message, io::Error>
{
    // Parse the string of data into serde_json::Value.
    let v: Value = serde_json::from_str(message.as_str())?;

    println!("Message from client : {}", v);
    // Access parts of the data by indexing with square brackets.
    
    //TODO: Handle Errors accessing these
    let event = v["event"].as_str().unwrap();
    let body = &v["body"];
    
    let response = match event
    {
        "GET" => get(body),
        "POST"=> post(body),
        _ => Err(io::Error::new(io::ErrorKind::Other, "Recieved an unregistered event! Are you sure you should be doing that?"))
    };

    response
}

fn get(body : &Value) -> Result<Message, io::Error>
{
    println!("document GET");
    let pString : &str = match body.as_str()
    {
        Some(txt) => txt,
        None => return Err(io::Error::new(io::ErrorKind::Other, "Unable to parse text in request body"))
    };
    let path : &Path = Path::new(pString);
    
    Ok(Message::text("{'event' : 'GET' }"))
}

fn post(body : &Value) -> Result<Message, io::Error>
{
    println!("document POST");
    Ok(Message::text("{'event' : 'POST' }"))
}