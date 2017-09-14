extern crate iron;
extern crate staticfile;
extern crate mount;
extern crate ws;
#[macro_use]
extern crate serde_json;

mod server_core;

use std::path::Path;
use std::thread;

use iron::Iron;
use staticfile::Static;
use mount::Mount;

fn main()
{
    //start a thread for serving static files
    thread::spawn(move || 
    {
        start_static_file_server();
    });
    //start the core websocket server
    server_core::start_server_core();
    
}

fn start_static_file_server()
{
    let mut mount = Mount::new();

    // Serve the public_html/
    mount.mount("/", Static::new(Path::new("./public_html")));

    Iron::new(mount).http("localhost:80").unwrap();
}