# Dungeons and Dragons Class Reference

The purpose of this project is to give new players a quick introduction of the class types in DnD. Relevant data of each class type is pulled from [D&D 5e API](http://www.dnd5eapi.co/) using [axios](https://github.com/axios/axios). This single page, mobile-responsive, web application is developed using React and styled with Bootstrap.

## Viewing the demo
*Warning: You might need to 'load unsafe scripts' if you see the shields icon on right most of the chrome browser*

You may view the demo here: https://auronsiow.github.io/DnDReferences/

## To run the project:

1) Clone the repo
2) `cd` into the project folder 
3) `yarn` or `npm install` to install all node_modules
4) `yarn start` or `npm start` to run the project (It will direct you to the localhost:3000 on your browser)

## Known Issue
##### Mixed Content Error #####
This is due to page being hosted on HTTPS (on GitHub) but the DnD API endpoint is using HTTP (insecure endpoint). Thus, after production deployment of this project with GitHub Pages, the load continues to load but error messages are shown on the console. As temporary work around for this issue, have to 'load unsafe scripts' as mentioned above.
However, on development environment, this issue does not surface.

## Future improvements
1) Add in unit test for each components
2) Integration with Jenkins
3) Fix the known issue above regarding Mixed Content

## Credits
This project was bootstrapped courtesy of [Create React App](https://github.com/facebookincubator/create-react-app)