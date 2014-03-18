#!/bin/bash

array=('socket.h' 'system.h' 'fork' 'exec')
ans=(answer1 answer2)
data=(input1 input2)


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
		echo "INCLUDE WRONG CODE!"
		exit 0
	fi;
done

var=$(gcc -o1 $1 $3 -o $2 2>&1)
if [ "$var" != '' ];
then
	echo $var
	exit 0
fi;

length=${#data[@]};
for ((i = 1; i <= $length; i++));
do
	if [ -e output ]; then
		rm output;
	fi

	./$2 <input$i >> output
	var=$(diff answer$i output)
        if [ "$var" = '' ];
        then
                echo "CORRECT"
        else
                echo "WRONG"
        fi;
done


