/* global after, describe, before, beforeEach, expect, it */
import { h, render } from 'preact' /** @jsx h */
import Autocomplete from '../../src/autocomplete'

function suggest (query, syncResults) {
  var results = [
    'France',
    'Germany',
    'United Kingdom'
  ]
  syncResults(query
    ? results.filter(function (result) {
      return result.toLowerCase().indexOf(query.toLowerCase()) !== -1
    })
    : []
  )
}

describe('Autocomplete', () => {
  describe('rendering', () => {
    let scratch

    before(() => {
      scratch = document.createElement('div');
      (document.body || document.documentElement).appendChild(scratch)
    })

    beforeEach(() => {
      scratch.innerHTML = ''
    })

    after(() => {
      scratch.parentNode.removeChild(scratch)
      scratch = null
    })

    describe('basic usage', () => {
      it('renders an input', () => {
        render(<Autocomplete />, scratch)

        expect(scratch.innerHTML).to.contain('input')
        expect(scratch.innerHTML).to.contain('class="autocomplete__input"')
        expect(scratch.innerHTML).to.contain('class="autocomplete__menu')
        expect(scratch.innerHTML).to.contain('name="input-autocomplete"')
      })

      it('renders an input with a name attribute', () => {
        render(<Autocomplete name='bob' />, scratch)

        expect(scratch.innerHTML).to.contain('name="bob"')
      })

      it('renders an input with a custom CSS namespace', () => {
        render(<Autocomplete cssNamespace='bob' />, scratch)

        expect(scratch.innerHTML).to.contain('class="bob__input"')
        expect(scratch.innerHTML).to.contain('class="bob__menu')
      })
    })
  })

  describe('behaviour', () => {
    let autocomplete, autoselectAutocomplete, onSelectAutocomplete, onSelectTriggered,
      autoselectOnSelectAutocomplete, selectOnBlurAutocomplete

    beforeEach(() => {
      autocomplete = new Autocomplete({
        ...Autocomplete.defaultProps,
        id: 'test',
        source: suggest
      })

      autoselectAutocomplete = new Autocomplete({
        ...Autocomplete.defaultProps,
        autoselect: true,
        id: 'test2',
        source: suggest
      })

      onSelectTriggered = false
      onSelectAutocomplete = new Autocomplete({
        ...Autocomplete.defaultProps,
        id: 'test3',
        onSelect: () => { onSelectTriggered = true },
        source: suggest
      })

      autoselectOnSelectAutocomplete = new Autocomplete({
        ...Autocomplete.defaultProps,
        autoselect: true,
        id: 'test4',
        onSelect: () => { onSelectTriggered = true },
        source: suggest
      })

      selectOnBlurAutocomplete = new Autocomplete({
        ...Autocomplete.defaultProps,
        id: 'test5',
        onSelect: () => { onSelectTriggered = true },
        selectOnBlur: false,
        source: suggest
      })
    })

    describe('typing', () => {
      it('searches for options', () => {
        autocomplete.handleInputChange({ target: { value: 'f' } })
        expect(autocomplete.state.menuOpen).to.equal(true)
        expect(autocomplete.state.options).to.contain('France')
      })

      it('hides menu when no options are available', () => {
        autocomplete.handleInputChange({ target: { value: 'aa' } })
        expect(autocomplete.state.menuOpen).to.equal(false)
        expect(autocomplete.state.options.length).to.equal(0)
      })

      it('hides menu when query becomes empty', () => {
        autocomplete.setState({ query: 'f', options: ['France'], menuOpen: true })
        autocomplete.handleInputChange({ target: { value: '' } })
        expect(autocomplete.state.menuOpen).to.equal(false)
      })

      describe('with minLength', () => {
        beforeEach(() => {
          autocomplete = new Autocomplete({
            ...Autocomplete.defaultProps,
            id: 'test',
            source: suggest,
            minLength: 2
          })
        })

        it('doesn\'t search when under limit', () => {
          autocomplete.handleInputChange({ target: { value: 'f' } })
          expect(autocomplete.state.menuOpen).to.equal(false)
          expect(autocomplete.state.options.length).to.equal(0)
        })

        it('does search when over limit', () => {
          autocomplete.handleInputChange({ target: { value: 'fra' } })
          expect(autocomplete.state.menuOpen).to.equal(true)
          expect(autocomplete.state.options).to.contain('France')
        })

        it('hides results when going under limit', () => {
          autocomplete.setState({ menuOpen: true, query: 'fr', options: ['France'] })
          autocomplete.handleInputChange({ target: { value: 'f' } })
          expect(autocomplete.state.menuOpen).to.equal(false)
          expect(autocomplete.state.options.length).to.equal(0)
        })
      })
    })

    describe('focusing input', () => {
      it('does not display menu when something is typed in', () => {
        autocomplete.setState({ query: 'f' })
        autocomplete.handleInputFocus()
        expect(autocomplete.state.menuOpen).to.equal(false)
        expect(autocomplete.state.focused).to.equal(-1)
      })

      it('hides menu when query is empty', () => {
        autocomplete.setState({ query: '' })
        autocomplete.handleInputFocus()
        expect(autocomplete.state.menuOpen).to.equal(false)
        expect(autocomplete.state.focused).to.equal(-1)
      })

      describe('with option selected', () => {
        it('leaves menu open, does not change query', () => {
          autocomplete.setState({ menuOpen: true, options: ['France'], query: 'fr', focused: 0, selected: 0 })
          autocomplete.handleInputFocus()
          expect(autocomplete.state.focused).to.equal(-1)
          expect(autocomplete.state.menuOpen).to.equal(true)
          expect(autocomplete.state.query).to.equal('fr')
        })
      })

      describe('with defaultValue', () => {
        beforeEach(() => {
          autocomplete = new Autocomplete({
            ...Autocomplete.defaultProps,
            defaultValue: 'France',
            id: 'test',
            source: suggest
          })
        })

        it('is prefilled', () => {
          expect(autocomplete.state.options.length).to.equal(1)
          expect(autocomplete.state.options[0]).to.equal('France')
          expect(autocomplete.state.query).to.equal('France')
        })
      })
    })

    describe('blurring input', () => {
      it('unfocuses component', () => {
        autocomplete.setState({ menuOpen: true, options: ['France'], query: 'fr', focused: -1, selected: -1 })
        autocomplete.handleInputBlur({ relatedTarget: null })
        expect(autocomplete.state.focused).to.equal(null)
        expect(autocomplete.state.menuOpen).to.equal(false)
        expect(autocomplete.state.query).to.equal('fr')
      })

      describe('with autoselect and onSelect', () => {
        it('unfocuses component, updates query, triggers onSelect', () => {
          autoselectOnSelectAutocomplete.setState({ menuOpen: true, options: ['France'], query: 'fr', focused: -1, selected: 0 })
          autoselectOnSelectAutocomplete.handleInputBlur({ target: 'mock', relatedTarget: 'relatedMock' }, 0)
          expect(autoselectOnSelectAutocomplete.state.focused).to.equal(null)
          expect(autoselectOnSelectAutocomplete.state.menuOpen).to.equal(false)
          expect(autoselectOnSelectAutocomplete.state.query).to.equal('France')
          expect(onSelectTriggered).to.equal(true)
        })
      })

      describe('with selectOnBlur false', () => {
        it('unfocuses component, does not touch query, does not trigger onSelect', () => {
          selectOnBlurAutocomplete.setState({ menuOpen: true, options: ['France'], query: 'fr', focused: -1, selected: 0 })
          selectOnBlurAutocomplete.handleInputBlur({ target: 'mock', relatedTarget: 'relatedMock' }, 0)
          expect(selectOnBlurAutocomplete.state.focused).to.equal(null)
          expect(selectOnBlurAutocomplete.state.menuOpen).to.equal(false)
          expect(selectOnBlurAutocomplete.state.query).to.equal('fr')
          expect(onSelectTriggered).to.equal(false)
        })
      })
    })

    describe('focusing option', () => {
      it('sets the option as focused', () => {
        autocomplete.setState({ options: ['France'] })
        autocomplete.handleOptionFocus(0)
        expect(autocomplete.state.focused).to.equal(0)
      })
    })

    describe('focusing out option', () => {
      describe('with input selected', () => {
        it('unfocuses component, does not change query', () => {
          autocomplete.setState({ menuOpen: true, options: ['France'], query: 'fr', focused: 0, selected: -1 })
          autocomplete.handleOptionFocusOut({ target: 'mock', relatedTarget: 'relatedMock' }, 0)
          expect(autocomplete.state.focused).to.equal(null)
          expect(autocomplete.state.menuOpen).to.equal(false)
          expect(autocomplete.state.query).to.equal('fr')
        })
      })

      describe('with option selected', () => {
        describe('with selectOnBlur true', () => {
          it('unfocuses component, updates query', () => {
            autocomplete.setState({ menuOpen: true, options: ['France'], query: 'fr', focused: 0, selected: 0 })
            autocomplete.handleOptionFocusOut({ target: 'mock', relatedTarget: 'relatedMock' }, 0)
            expect(autocomplete.state.focused).to.equal(null)
            expect(autocomplete.state.menuOpen).to.equal(false)
            expect(autocomplete.state.query).to.equal('France')
          })
        })
        describe('with selectOnBlur false', () => {
          it('unfocuses component, does not update query', () => {
            selectOnBlurAutocomplete.setState({ menuOpen: true, options: ['France'], query: 'fr', focused: 0, selected: 0 })
            selectOnBlurAutocomplete.handleOptionFocusOut({ target: 'mock', relatedTarget: 'relatedMock' }, 0)
            expect(selectOnBlurAutocomplete.state.focused).to.equal(null)
            expect(selectOnBlurAutocomplete.state.menuOpen).to.equal(false)
            expect(selectOnBlurAutocomplete.state.query).to.equal('fr')
          })
        })
      })
    })

    describe('hovering option', () => {
      it('sets the option as hovered, does not change focused, does not change selected', () => {
        autocomplete.setState({ options: ['France'], hovered: null, focused: -1, selected: -1 })
        autocomplete.handleOptionMouseEnter({}, 0)
        expect(autocomplete.state.hovered).to.equal(0)
        expect(autocomplete.state.focused).to.equal(-1)
        expect(autocomplete.state.selected).to.equal(-1)
      })
    })

    describe('hovering out option', () => {
      it('sets focus back on selected, sets hovered to null', () => {
        autocomplete.setState({ options: ['France'], hovered: 0, focused: -1, selected: -1 })
        autocomplete.handleOptionMouseOut({ toElement: 'mock' }, 0)
        expect(autocomplete.state.hovered).to.equal(null)
        expect(autocomplete.state.focused).to.equal(-1)
        expect(autocomplete.state.selected).to.equal(-1)
      })
    })

    describe('up key', () => {
      it('focuses previous element', () => {
        autocomplete.setState({ menuOpen: true, options: ['France'], focused: 0 })
        autocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 38 })
        expect(autocomplete.state.focused).to.equal(-1)
      })
    })

    describe('down key', () => {
      describe('0 options available', () => {
        it('does nothing', () => {
          autocomplete.setState({ menuOpen: false, options: [], focused: -1 })
          const stateBefore = autocomplete.state
          autocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 40 })
          expect(autocomplete.state).to.equal(stateBefore)
        })
      })

      describe('1 option available', () => {
        it('focuses next element', () => {
          autocomplete.setState({ menuOpen: true, options: ['France'], focused: -1, selected: -1 })
          autocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 40 })
          expect(autocomplete.state.focused).to.equal(0)
          expect(autocomplete.state.selected).to.equal(0)
        })
      })

      describe('2 or more option available', () => {
        it('focuses next element', () => {
          autocomplete.setState({ menuOpen: true, options: ['France', 'Germany'], focused: 0, selected: 0 })
          autocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 40 })
          expect(autocomplete.state.focused).to.equal(1)
          expect(autocomplete.state.selected).to.equal(1)
        })
      })

      describe('autoselect', () => {
        describe('0 options available', () => {
          it('does nothing', () => {
            autoselectAutocomplete.setState({ menuOpen: false, options: [], focused: -1, selected: -1 })
            const stateBefore = autoselectAutocomplete.state
            autoselectAutocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 40 })
            expect(autoselectAutocomplete.state).to.equal(stateBefore)
          })
        })

        describe('1 option available', () => {
          it('does nothing', () => {
            autoselectAutocomplete.setState({ menuOpen: true, options: ['France'], focused: -1, selected: 0 })
            const stateBefore = autoselectAutocomplete.state
            autoselectAutocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 40 })
            expect(autoselectAutocomplete.state).to.equal(stateBefore)
          })
        })

        describe('2 or more option available', () => {
          it('on input, focuses second element', () => {
            autoselectAutocomplete.setState({ menuOpen: true, options: ['France', 'Germany'], focused: -1, selected: 0 })
            autoselectAutocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 40 })
            expect(autoselectAutocomplete.state.focused).to.equal(1)
            expect(autoselectAutocomplete.state.selected).to.equal(1)
          })
        })
      })
    })

    describe('escape key', () => {
      it('unfocuses component', () => {
        autocomplete.setState({ menuOpen: true, options: ['France'], focused: -1 })
        autocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 27 })
        expect(autocomplete.state.menuOpen).to.equal(false)
        expect(autocomplete.state.focused).to.equal(null)
      })
    })

    describe('enter key', () => {
      describe('on an option', () => {
        it('prevents default, closes the menu, sets the query, focuses the input, triggers onSelect', () => {
          let preventedDefault = false
          onSelectAutocomplete.setState({ menuOpen: true, options: ['France'], focused: 0, selected: 0 })
          onSelectAutocomplete.handleKeyDown({ preventDefault: () => { preventedDefault = true }, keyCode: 13 })
          expect(onSelectAutocomplete.state.menuOpen).to.equal(false)
          expect(onSelectAutocomplete.state.query).to.equal('France')
          expect(onSelectAutocomplete.state.focused).to.equal(-1)
          expect(onSelectAutocomplete.state.selected).to.equal(-1)
          expect(preventedDefault).to.equal(true)
          expect(onSelectTriggered).to.equal(true)
        })
      })

      describe('on the input', () => {
        describe('with menu opened', () => {
          it('prevents default, does nothing', () => {
            let preventedDefault = false
            autocomplete.setState({ menuOpen: true, options: [], query: 'asd', focused: -1, selected: -1 })
            const stateBefore = autocomplete.state
            autocomplete.handleKeyDown({ preventDefault: () => { preventedDefault = true }, keyCode: 13 })
            expect(autocomplete.state).to.equal(stateBefore)
            expect(preventedDefault).to.equal(true)
          })
        })

        describe('with menu closed', () => {
          it('bubbles, does not prevent default', () => {
            let preventedDefault = false
            autocomplete.setState({ menuOpen: false, options: ['France'], focused: -1, selected: -1 })
            const stateBefore = autocomplete.state
            autocomplete.handleKeyDown({ preventDefault: () => { preventedDefault = true }, keyCode: 13 })
            expect(autocomplete.state).to.equal(stateBefore)
            expect(preventedDefault).to.equal(false)
          })
        })

        describe('autoselect', () => {
          it('closes the menu, selects the first option, keeps input focused', () => {
            autoselectAutocomplete.setState({ menuOpen: true, options: ['France'], focused: -1, selected: 0 })
            autoselectAutocomplete.handleKeyDown({ preventDefault: () => {}, keyCode: 13 })
            expect(autoselectAutocomplete.state.menuOpen).to.equal(false)
            expect(autoselectAutocomplete.state.query).to.equal('France')
            expect(autoselectAutocomplete.state.focused).to.equal(-1)
            expect(autoselectAutocomplete.state.selected).to.equal(-1)
          })
        })
      })
    })

    describe('a printable key', () => {
      it('on an option, focuses the input, does not change selected', () => {
        autocomplete.setState({ menuOpen: true, options: ['France'], focused: 0, selected: 0 })
        autocomplete.elementRefs[-1] = 'input element'
        autocomplete.handleKeyDown({ target: 'not the input element', keyCode: 65 })
        expect(autocomplete.state.focused).to.equal(-1)
        expect(autocomplete.state.selected).to.equal(0)
      })
    })

    describe('an unrecognised key', () => {
      it('does nothing', () => {
        autocomplete.setState({ menuOpen: true, options: ['France'], focused: 0, selected: 0 })
        autocomplete.elementRefs[-1] = 'input element'
        autocomplete.handleKeyDown({ target: 'not the input element', keyCode: 4242 })
        expect(autocomplete.state.focused).to.equal(0)
        expect(autocomplete.state.selected).to.equal(0)
      })
    })
  })
})