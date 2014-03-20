#!/bin/bash

length=$(ls | grep input | wc -l);
length=${length#0}*1;
for ((i = 1; i <= $length; i = i + 1))
do
	if [ -e output ]; then
		rm output;
	fi

	./out <input$i >> output
	var=$(diff answer$i output)
        if [ "$var" = '' ];
        then
                echo "CORRECT"
        else
                echo "WRONG"
        fi;
done


