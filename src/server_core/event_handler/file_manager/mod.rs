extern crate serde_json;

use std::path::{Path,PathBuf};
use serde_json::{Value};
use std::{fs, io};
use std::fs::ReadDir;
use std::vec::Vec;

mod ot;

fn init(rootPath : String) {
    let root_dir = Path::new(&rootPath);
    /*
    match read_filenames_from_dir(root_dir)
    {
        Err(e) => println!("Error reading root Dir : {}", e ),
        Ok(result) => build_dir_tree(result) 
    }*/
}

pub fn get_dir(stringPath : &str) -> Result<Value, io::Error>
{
    let path = Path::new(stringPath);
    let paths = fs::read_dir(path)?;
    
    let mut dirVec : Vec<Value> = Vec::new();
    let mut fileVec : Vec<Value> = Vec::new();
    for entry in paths
    {
        match read_dir_entry(entry)
        {
            Ok((isDir, dir_entry)) =>
            {
                if isDir { dirVec.push(dir_entry) } else { fileVec.push(dir_entry) }
            },
            Err(e) => return Err(e)
        };
        
    }
    
    //return the jsonified result
    Ok(json!(
        {
            "base" : path.to_str().unwrap(),
            "dirs" : json!(dirVec),
            "files" : json!(fileVec)
        }
    ))
}

fn read_dir_entry(entry : Result<fs::DirEntry, io::Error>) -> Result<(bool,Value), io::Error>
{
    match entry
    {
        Ok(entry_path) => 
        {
            let path : PathBuf = entry_path.path();
            
            if path.is_dir()
            {
                Ok((true,jsonify_dir(path)))
            }else
            {
                Ok((false,jsonify_file(path)))
            }
        },
        Err(e) => Err(e)
    }
}

fn jsonify_dir(path : PathBuf) -> Value
{
    //these paths are directories
    json!(path.file_stem().unwrap().to_str().unwrap())
}

fn jsonify_file(path : PathBuf) -> Value
{
    //these paths are files
    json!(
        {
            "path" : path.to_str().unwrap(),
            "extension" : path.extension().unwrap().to_str().unwrap()
        }
    )
}