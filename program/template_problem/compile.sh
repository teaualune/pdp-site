#!/bin/bash

array=('socket.h' 'system.h' 'fork' 'exec' 'unistd.h')


var=$(gcc -E $1 -o pre_$1 2>&1)
if [ "$var" != '' ];
then
	echo $var
	exit 0
fi;

for name in "${array[@]}"
do
	var=$(grep $name pre_$1)
	
	if [ "$var" != '' ];
	then
		echo "INCLUDE ILLEGAL CODE!"
		exit 0
	fi;
done

var=$(gcc -w -o1 $1 -o out 2>&1)
if [ "$var" != '' ];
then
	echo $var
	exit 0
fi;

