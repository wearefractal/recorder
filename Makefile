build: components lib
	@rm -rf dist
	@mkdir dist
	@node_modules/.bin/coffee -b -o dist -c lib/*.coffee
	@node_modules/.bin/component build --standalone recorder
	@mv build/build.js recorder.js
	@rm -rf build
	@node_modules/.bin/uglifyjs -nc --unsafe -mt -o recorder.min.js recorder.js
	@echo "File size (minified): " && cat recorder.min.js | wc -c
	@echo "File size (gzipped): " && cat recorder.min.js | gzip -9f  | wc -c
	@cp ./recorder.js ./examples/

test: build lib
	@node_modules/.bin/mocha --compilers coffee:coffee-script

components: component.json
	@node_modules/.bin/component install --dev

docs: lib
	@node_modules/.bin/lidoc README.md manual/*.md lib/*.coffee --output docs --github wearefractal/recorder

docs.deploy: docs
	@cd docs && \
  git init . && \
  git add . && \
  git commit -m "Update documentation"; \
  git push "https://github.com/wearefractal/recorder" master:gh-pages --force && \
  rm -rf .git

clean:
	@rm -rf dist
	@rm -rf components
	@rm -rf build
	@rm -rf docs

.PHONY: test docs docs.deploy