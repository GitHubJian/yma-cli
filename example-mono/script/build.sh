CRTDIR=$(pwd)

for var in common core core1; do
    cd $CRTDIR

    cd ./package/$var

    npm run b

done
