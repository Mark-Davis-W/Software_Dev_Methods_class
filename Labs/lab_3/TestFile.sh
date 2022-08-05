#!/bin/bash

PASSED=$1
	
count_lines(){
	echo -n "The number of lines in this file is... "
	cat $PASSED | sed -n '$='
}	

count_words(){
	grep -Eni --color "lorem"\|"model"\|"ipsum"\|"will" $PASSED
}

add_text(){
	echo "Please enter the text you wish to add to this file:"
	read help
   	echo -ne "\n$help" | tee -a $PASSED
}

copy_and_exit(){
	if [[ ! -d "solution" ]];then
		mkdir ./solution
		cp $PASSED ./solution/
	else
		cp -u $PASSED ./solution/
	fi
	exit 0
}

if [ -f $PASSED ] && [ $# -lt 2 ]; then
	echo "$PASSED is a valid filename in this directory."
	continue	
elif [ -d $PASSED ]; then
	echo "$PASSED is a directory not a file."
	exit 1
elif [ $# -gt 1 ]; then
	echo "Sorry too many arguments."
	exit 1
else
	echo "$PASSED is not present in this directory."
	exit 1
fi

clear

while(true)
	do
	
	printf "\n#########################################################\n"
	printf "\nChoose from the following choices: \n"
	printf "\n[L]Count Lines\n[W]Count Words\n[A]Add Text\n[E]Exit\n"
	printf "\n#########################################################\n\n"
	read -p "Your choice: " choice

	case $choice in
	[lL])
		count_lines $1
	;;
	[wW])
		count_words $1
	;;
	[aA])
		add_text
	;;
	[eE])
		copy_and_exit
	;;
	*)
		echo "Incorrect choice, please try again!"
	esac

done
