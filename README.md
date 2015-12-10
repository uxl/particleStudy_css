# README for particleStudy_css

Yo Webapp scaffold with buildcontrol deploy to gh-pages

## System Dependencies
( Load these files if you don't have them already )

No SUDO version of node  
``` sh
brew install node --without-npm
mkdir "${HOME}/.npm-packages"
echo NPM_PACKAGES="${HOME}/.npm-packages" >> ${HOME}/.bashrc
echo prefix=${HOME}/.npm-packages >> ${HOME}/.npmrc
curl -L https://www.npmjs.org/install.sh | sh
echo NODE_PATH=\"\$NPM_PACKAGES/lib/node_modules:\$NODE_PATH\" >> ${HOME}/.bashrc
echo PATH=\"\$NPM_PACKAGES/bin:\$PATH\" >> ${HOME}/.bashrc
echo source "~/.bashrc" >> ${HOME}/.bash_profile
source ~/.bashrc
```
install bower  
`npm install -g bower`

install grunt command line ( might need sudo )  
`npm install -g grunt-cli`

## Development environment
1. `git clone git@github.com:uxl/particleStudy_css.git`
2. `cd particleStudy_css`
3. `bower install` will install dependencies
4. `npm install` will install grunt and node modules
5. `grunt server` will build and initiate watch along with Livereload

## Deployment
Deploy to gh-pages (public):
http://uxl.github.io/particleStudy_css/

``` sh
grunt build
grunt deploy
```


#Build Tools

* Grunt
* Yeoman
* Yeoman Webapp-Generator
* Bower

##Contributing

Features and fixes should be submitted as a Pull Request. These will be reviewed and merged as they are ready.

# particleStudy_css
