extern crate ws;

use std::rc::Rc;
use std::cell::Cell;
mod event_handler;

use ws::{listen, Handler, Sender, Request, Response, Result, Message, Handshake, CloseCode, Error};

struct Server {
    out: Sender,
    count: Rc<Cell<u32>>,
}

impl Handler for Server {

    fn on_open(&mut self, _: Handshake) -> Result<()> {
        // We have a new connection, so we increment the connection counter
        Ok(self.count.set(self.count.get() + 1))
    }

    fn on_message(&mut self, msg: Message) -> Result<()> {
        // Tell the user the current count
        println!("The number of live connections is {}", self.count.get());
        if msg.is_text()
        {
            match msg.into_text()
            {
                Ok(json) => 
                {
                    let response = event_handler::handle_message(json);
                    //unwrap the response and send it back to the socket
                    match response
                    {
                        Ok(txt) =>  
                        {
                            self.out.send(txt);
                        },
                        Err(e) => 
                        {
                            let txt = format!("{{ \"err\" : \"{}\" }}", e);
                            self.out.send(Message::text(txt.as_str()));
                        }
                    }
                    
                },
                Err(e) => println!("Error parsing message body : {}", e)
            }
            
        }
        Ok(())
        // Echo the message back
        //
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        match code {
            CloseCode::Normal => println!("The client is done with the connection."),
            CloseCode::Away   => println!("The client is leaving the site."),
            CloseCode::Abnormal => println!(
                "Closing handshake failed! Unable to obtain closing status from client."),
            _ => println!("The client encountered an error: {}", reason),
        }

        // The connection is going down, so we need to decrement the count
        self.count.set(self.count.get() - 1)
    }

    fn on_error(&mut self, err: Error) {
        println!("The server encountered an error: {:?}", err);
    }

}

pub fn start_server_core() 
{
  // Cell gives us interior mutability so we can increment
  // or decrement the count between handlers.
  // Rc is a reference-counted box for sharing the count between handlers
  // since each handler needs to own its contents.
  let count = Rc::new(Cell::new(0));
  listen("0.0.0.0:3012", |out| { Server { out: out, count: count.clone() } }).unwrap()
} 
