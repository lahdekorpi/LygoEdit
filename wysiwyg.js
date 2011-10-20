wysiwyg = {

    mediaPicker: false,
    urlPicker: false,
    stylePicker: false,
    lastFocused: false,
    lastElement: false,
    highlighted: false,
    xpathText: "",
    highlighter: false,
    toolbar: false,
    statusbar: false,

	buttons: {
		'b': {
			'title':"Bold",
			'shortcut':"ctrl+b", // TODO: this will be used to set the actualy bindings later
			'html':'B'
		},
		'i': {
			'title':"Italic",
			'shortcut':"ctrl+",
			'html':'I'
		},
		'u': {
			'title':"Underline",
			'shortcut':"ctrl+",
			'html':'U'
		},
		'r': {
			'title':"Remove Formatting",
			'shortcut':"ctrl+",
			'html':'R'
		},
		'l': {
			'title':"Insert Link",
			'shortcut':"ctrl+",
			'html':'url'
		},
		'img': {
			'title':"Insert Image",
			'shortcut':"ctrl+",
			'html':'img'
		},
		'plus': {
			'title':"Add Element",
			'shortcut':"ctrl+",
			'html':'+'
		},
	},

    unSelect: function() {
        wysiwyg.lastFocused = false;
        // Forget the last one we had focus, so we don't refocus
        $(":focus").blur();
        // Out with the focus
        $(".highlighted").removeClass("highlighted");

        // We reset the border-width so that if the document size is now smaller we don't get any scrollbars. Oh and we hide the highlighter with opacity 0 (styling thing)
        wysiwyg.highlighter.removeClass("visible");
        wysiwyg.highlighter.css("border-width", 0);

    },

    xpath: function(startPath) {
        var path = $(startPath).parents().andSelf();
        var xpath = "";
        for (var i = 0; i < path.length; i++) {
            var nd = path[i].nodeName.toLowerCase();
            xpath += '/';
            if (nd != 'html' && nd != 'body') {
                xpath += nd + '[' + ($(path[i - 1]).children().index(path[i]) + 1) + ']';
            }
            else {
                xpath += nd;
            }
        }
        return xpath;
    },

    highlight: function() {
        focusNode = window.getSelection().focusNode;
        if (focusNode != null) {


            currentElement = focusNode.parentNode;
            if (wysiwyg.lastElement != currentElement) {
                wysiwyg.lastElement = currentElement;
                wysiwyg.xpathText = wysiwyg.xpath(currentElement);
                $("nav#statusbar div.xpath").text(wysiwyg.xpathText);

                // Is our selection actually in some element
                // We update the style picker, first we look up the type of element our cursor is located in and set the style pickers option accordingly
                // TODO check if the picker actually has that item, if not, just select title or something fancy
                $("nav#toolbar form.style select option").removeAttr('selected');
                $("nav#toolbar form.style select option[value='"
                + focusNode
                .parentNode
                .tagName
                .toLowerCase()
                + "']").attr('selected', true);
            }

            if ($("[contenteditable='true']").is(":focus")) {
                highlighted = $(".highlighted");

                wysiwyg.toolbar.addClass("active");
                wysiwyg.statusbar.addClass("active");

                offset = highlighted.offset()

                borderLeft = offset.left - 20;
                borderTop = offset.top - 20;

                borderRight = $(document).width() - borderLeft - highlighted.width() - 40;
                borderBottom = $(document).height() - borderTop - highlighted.height() - 40;

                // TODO: max seems to be 12287px in chrome, check others and make another div (or :after) and position it under the border and fill up the rest of the page. Obviously this only happens when the page is huge
                wysiwyg.highlighter.css("border-left-width", borderLeft);
                wysiwyg.highlighter.css("border-top-width", borderTop);
                wysiwyg.highlighter.css("border-right-width", borderRight);
                wysiwyg.highlighter.css("border-bottom-width", borderBottom);

                // Set the size of the highlighter
                wysiwyg.highlighter.width(highlighted.width() + 40);
                wysiwyg.highlighter.height(highlighted.height() + 40);

                // Set the position
                wysiwyg.highlighter.css("top", 0);
                wysiwyg.highlighter.css("left", 0);
                wysiwyg.highlighter.addClass("visible");
                wysiwyg.highlighted = true;
            }
        } else {
            if (wysiwyg.highlighted) {
                wysiwyg.toolbar.removeClass("active");
				wysiwyg.statusbar.removeClass("active");
                wysiwyg.highlighter.removeClass("visible");
                wysiwyg.highlighter.css("border-width", 0);
                // We reset the width so that the size doesn't grow as document size does
                wysiwyg.highlighted = false;
            }
            else wysiwyg.highlighted = true;
        }
    },

	createUI: function() {
	/*
	<div id="highlighter" contentEditable="false"></div>
	<nav id="toolbar" contentEditable="false">
		<a class="title">page<small>.html</small></a>
		<div class="buttons">
			<a class="button button-b spacer" href="#" title="Bold - Command + B">B</a>
			<a class="button button-i" href="#" title="Italic - Command + I">I</a>
			<a class="button button-u" href="#" title="Underline - Command + U">U</a>
			<a class="button button-r" href="#" title="Remove formatting - Command + R">R</a>
			<a class="button button-l spacer" href="#" title="Insert URL - Alt + Command + L">url</a>
			<a class="button button-img" href="#" title="Insert Image - Command + I">img</a>
			<a class="button button-plus" href="#" title="Insert Element">+</a>
		</div>
			<form class="style spacer">
				<select>
					<option value="class">Style</option>
					<option disabled>-</option>
					<option value="h1">Heading 1</option>
					<option value="h2">Heading 2</option>
					<option value="h3">Heading 3</option>
					<option value="h4">Heading 4</option>
					<option value="h5">Heading 5</option>
					<option disabled>-</option>
					<option value="div">Division</option>
					<option value="p">Paragraph</option>
					<option value="a">Anchor</option>
					<!--<option value="code">Code</option>-->
					<option value="pre">Preformatted</option>
					<option disabled>-</option>
					<option value="plip">.plip</option>
					<option value="plop">.plop</option>
				</select>
			</form>

		<a class="save" href="#">Save</a>
		</nav>
		<nav id="statusbar">
			<div class="xpath"></div>
		</nav>
		<nav id="mediaselector">
			<ul>
				<li>Item</li>
				<li>Other image</li>
			</ul>
		</nav>
		
		$('body').append(
			$('<div/>')
				.attr("id","wysiwyg")
				.append(
					$("<div/>")
						.attr("id","highlighter"),
					
				$("<nav/>")
					.attr("id","toolbar")
					.append("</a>")
						.addClass("title")
						.html("page<small>.html</small>")
				)
		);
		*/
		
		$('body').append(
			$('<div/>')
				.attr("id","wysiwyg")
				.append(
					$("<div/>")
						.attr("id","highlighter"),
					$("<nav/>")
						.attr("id","toolbar")
						.append(
							$("<a/>")
								.addClass("title")
								.html("page<small>.html</small>"),
							$("<div/>")
								.addClass("buttons"),
							$("<form/>")
								.addClass("style spacer")
								.append("<select/>"),
							$("<a/>")
								.addClass("save")
								.attr("href","#")
								.text("Save")
						),
					$("<nav/>")
						.attr("id","statusbar")
						.append(
							$("<div/>")
								.addClass("xpath")
						),
					$("<nav/>")
						.attr("id","mediaselector")
						.append(
							$("<ul/>")
								.append("<li>")
									.text("test")
						)
				)
		);
	},
	
	createButtons: function() {
	/*
	<div class="buttons">
		<a class="button button-b spacer" href="#" title="Bold - Command + B">B</a>
		<a class="button button-i" href="#" title="Italic - Command + I">I</a>
		<a class="button button-u" href="#" title="Underline - Command + U">U</a>
		<a class="button button-r" href="#" title="Remove formatting - Command + R">R</a>
		<a class="button button-l spacer" href="#" title="Insert URL - Alt + Command + L">url</a>
		<a class="button button-img" href="#" title="Insert Image - Command + I">img</a>
		<a class="button button-plus" href="#" title="Insert Element">+</a>
	</div>
	*/
	// change div to ul?
	

	
		$.each(wysiwyg.buttons, function(button, data) {
			$("div#wysiwyg nav#toolbar div.buttons").append(
				$("<a/>")
					.addClass("button")
					.addClass("button-"+button)
					.attr("href","#")
					.attr("title",data.title+" - "+data.shortcut)
					.html(data.html)
			);
		});
		
	},
	
	createStyles: function() {
	/*
		<form class="style spacer">
			<select>
				<option value="class">Style</option>
				<option disabled>-</option>
				<option value="h1">Heading 1</option>
				<option value="h2">Heading 2</option>
				<option value="h3">Heading 3</option>
				<option value="h4">Heading 4</option>
				<option value="h5">Heading 5</option>
				<option disabled>-</option>
				<option value="div">Division</option>
				<option value="p">Paragraph</option>
				<option value="a">Anchor</option>
				<!--<option value="code">Code</option>-->
				<option value="pre">Preformatted</option>
				<option disabled>-</option>
				<option value="plip">.plip</option>
				<option value="plop">.plop</option>
			</select>
		</form>
	*/
		
		
	},

    init: function() {

		wysiwyg.createUI();
		wysiwyg.createButtons();
		wysiwyg.createStyles();

        wysiwyg.highlighter = $("div#wysiwyg div#highlighter");
        wysiwyg.toolbar = $("div#wysiwyg nav#toolbar");
        wysiwyg.statusbar = $("div#wysiwyg nav#statusbar");

        $("*").live("blur",
        function(e) {
            wysiwyg.highlight();
            lastFocused = false;
        });

        $(window).resize(function() {
            wysiwyg.highlight();
            // We reposition our highlighter each time the document is resized
        });

		// This might look like a mess but.. it.. I.. well.. fuck it.
        $("[contenteditable='true']").live("keyup keydown paste mousemove mouseup mousedown",
        function() {
            wysiwyg.highlight();
        });

        $("nav#toolbar a.title").click(function() {
            // Do magic
            });

        $("[contentEditable='true']").live("focus",
        function() {

            $(".highlighted").removeClass("highlighted");
            $(this).addClass("highlighted");


            // WARNING! WARNING! WARNING! WARNING! WARNING! WARNING!
            // WARNING! HORRIBLE FIREFOX HACK AHEAD
            lastFocused = this;

            // WARNING! WARNING! WARNING! WARNING! WARNING! WARNING!
            // WARNING! WARNING! WARNING! WARNING! WARNING! WARNING!
            // WARNING! Gecko is becoming much worse than IE ever was!
            wysiwyg.highlight();
        });

        $("a.button-b").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.execCommand("bold", false, null);
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $("a.button-i").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.execCommand("italic", false, null);
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $("a.button-u").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.execCommand("underline", false, null);
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $("a.button-r").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.execCommand("removeFormat", false, null);
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $("a.button-l").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var linkPrompt = prompt("Enter Link:", "http://");
            document.execCommand("createLink", false, linkPrompt);
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $("a.save").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var tmpSave;
            $("[contenteditable='true']").each(function() {
                tmpSave += $(this).attr("id");
                tmpSave += ": ";
                tmpSave += $(this).html();
                tmpSave += "\n\n";
            });
            alert(tmpSave);
            console.log(tmpSave);
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $(document).bind('keydown', 'meta+b',
        function(e) {
            document.execCommand("bold", false, null);
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });
        $(document).bind('keydown', 'ctrl+b',
        function(e) {
            document.execCommand("bold", false, null);
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $(document).bind('keydown', 'meta+i',
        function(e) {
            document.execCommand("italic", false, null);
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $(document).bind('keydown', 'ctrl+i',
        function(e) {
            document.execCommand("italic", false, null);
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $(document).bind('keydown', 'meta+u',
        function(e) {
            document.execCommand("underline", false, null);
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });
        $(document).bind('keydown', 'ctrl+u',
        function(e) {
            document.execCommand("underline", false, null);
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $(document).bind('keydown', 'meta+r',
        function(e) {
            document.execCommand("removeFormat", false, null);
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });
        $(document).bind('keydown', 'ctrl+r',
        function(e) {
            document.execCommand("removeFormat", false, null);
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });

        $(document).bind('keydown', 'esc',
        function(e) {
            wysiwyg.unSelect();
            e.preventDefault();
            e.stopPropagation();
            $(lastFocused).focus();
            wysiwyg.highlight();
        });


        $("nav#toolbar form.style select").change(function(e) {
            document.execCommand("FormatBlock", null, $(this).val());
        });
    }
};

$(document).ready(function() {
    wysiwyg.init();


});
