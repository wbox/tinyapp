#!/bin/bash

NODE_PID=`pidof node`

 if [ ! -z $NODE_PID ]; then
   kill -9 $NODE_PID
 fi

nohup node express_server.js &



