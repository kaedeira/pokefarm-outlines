// ==UserScript==
// @name         Outline Pokémon
// @namespace    https://pokefarm.com/
// @version      2025-07-09
// @description  Creates a settings page for outlining Pokémon images on site.
// @author       Hakano Riku
// @match        https://pokefarm.com/*
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @updateURL  https://github.com/kaedeira/pokefarm-outlines/raw/refs/heads/main/pokefarm-outlines.user.js
// @downloadURL  https://github.com/kaedeira/pokefarm-outlines/raw/refs/heads/main/pokefarm-outlines.user.js
// @run-at document-start
// ==/UserScript==
/* eslint-disable */

$(document).ready(function( $ ) {
    $.noConflict();
    const path = window.location.pathname;
    const page = path.split('/')[1];

    const example_images = [
        '/img/pkmn/h/w/o/h.png',
        '/img/pkmn/g/r/q/j.png',
        '/img/pkmn/j/w/f/x.png',
        '/img/pkmn/4/h/d/9.png'
    ];

    const page_layouts = {
        'party'   : 'Party',
        'user'    : 'User Page',
        'users'   : 'Multi-User',
        'fields'  : 'Field',
        'scour'   : 'Scour',
        'lab'     : 'Lab',
        'shelter' : 'Shelter',
        'daycare' : 'Daycare'
    };

    let page_settings = {
        'general' : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF', 'advanced' : false },
        'party'   : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF' },
        'user'    : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF' },
        'users'   : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF' },
        'fields'  : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF' },
        'scour'   : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF' },
        'lab'     : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF' },
        'shelter' : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF' },
        'daycare' : { 'enabled' : true, 'thickness' : 1, 'color' : '#FFFFFF' }
    };

    // Outline settings page
    const generalSettings = `<div class="outline-opts">
                    <p>This script is for creating outlines around Pokémon sprites for better visibility. These options include changing the thickness of the outlines, the color, and which pages' sprites to outline.</p>
                    <table style='width: 100%;'>
                    <tr><td><h3>General Settings</h3></td></tr>
                    <tr><td><input type='checkbox' name='outline-enable' value=true><label for='outline-enable'>Enable Outlines</label></td></tr>
                    <tr><td><input type='number' name='outline-thickness' min=1 max=5><label for='outline-thickness'>Outline Thickness</label></td></tr>
                    <tr><td><label for='outline-color'>Outline Color</label><input type='text' name='outline-color' placeholder='#000000'><input type='color' name='outline-colorwheel'></td></tr>
                    <tr><td><label for='enable-per-page'>Enable Per-Page Settings</label><input type='checkbox' name='enable-per-page' value=false></td></tr>
                    <tr><td><div id='outline-page'></div></td></tr>
                    </table>`;

    const perPageSettings = `<tr><td><h3>Per-Page Settings</h3></tr>
                    <tr><td>
                    <label for='outline-page'>Page Select</label>
                    <select name='outline-page'>
                    <option value='party'>Party</option>
                    <option value='user'>Profile</option>
                    <option value='users'>Multiuser</option>
                    <option value='fields'>Fields</option>
                    <option value='scour'>Scours</option>
                    <option value='lab'>Lab</option>
                    <option value='shelter'>Shelter</option>
                    <option value='daycare'>Daycare</option>
                    </select>
                    </td></tr>`;

    // Get and/or set cookie data
    const cookie_name = 'OutlineSettings';
    const cookies = document.cookie.split(';');

    const cookieGet = () => {
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(cookie_name + "=")) {
                const cookie_value = cookie.substring(cookie_name.length + 1);
                try {
                    return JSON.parse(cookie_value);
                } catch (e) {
                    console.log('Unable to parse cookies.');
                    return null;
                }
            }
        }
        return null;
    };

    const cookieSet = (settings) => {
        try {
            document.cookie = `OutlineSettings=${JSON.stringify(settings)}; SameSite=Lax; Secure`;
        } catch (e) {
            console.log('Unable to set cookie data.');
        }
    };

    // Set default cookie settings if not yet set
    const cookie = cookieGet();
    !cookie ? cookieSet(page_settings) : page_settings = cookie;
    if (cookie == null) {
        cookieSet(page_settings);
    } else {
        page_settings = cookie;
        console.log(cookie);
    }

    // Setup settings button in announcements bar
    const announcements = $('#announcements > ul > li');
    announcements.each((i, e) => {
        if ($(e).attr('class') == 'spacer') {
            let button = $(`<li data-name='Outline Options'><a href='#' title='Outline Settings'><img src='/img/items/legendfci_genies.png' alt='Outline Options' loading='lazy'> Outline</a></li>`).css('cursor', 'pointer');
            $(button).on('click', (b) => {
                b.preventDefault();
                (new Dialog(
                    "Outline Options",
                    generalSettings,
                    [{
                        text: "Close",
                        right: !0,
                        action: () => {
                            // Revert settings back to cookie data
                            page_settings = cookieGet();
                            console.log('Closed settings');
                        }
                    },
                    {
                        text: "Save",
                        left: !0,
                        action: () => {
                            // Save settings to cookie data and update
                            cookieSet(page_settings);
                        }
                    }]
                )).opened(async () => {
                    let sprites = [];
                    sprites[0] = await getSprite(example_images[0]);
                    sprites[1] = await getSprite(example_images[1]);
                    sprites[2] = await getSprite(example_images[2]);
                    sprites[3] = await getSprite(example_images[3]);

                    const examples = `<table style='width: 100%;'>
                                      <tr><td><h4>Outline Examples</h4></td></tr>
                                      <tr><td><div id='outline-examples'><ul class='spritelist'>
                                      <li class='plateform'><div class='pokemon' style='background-image: url(${sprites[0].src});'></div></li>
                                      <li class='plateform'><div class='pokemon' style='background-image: url(${sprites[1].src});'></div></li>
                                      <li class='plateform'><div class='pokemon' style='background-image: url(${sprites[2].src});'></div></li>
                                      <li class='plateform'><div class='pokemon' style='background-image: url(${sprites[3].src});'></div></li>
                                      </ul></div></td></tr>
                                      </table>`;

                    let style = `.spritelist { list-style-type: none; padding: 0; margin: 0; text-align: center; }
                                 .spritelist > li { display: inline-block; margin: 0 8px 8px; }
                                 .plateform { width: 100px; height: 100px; box-sizing: border-box; position: relative; }
                                 .plateform:before {
                                     content: '';
                                     display: block;
                                     width: 100%;
                                     height: 40%;
                                     border-radius: 50%;
                                     box-sizing: border-box;
                                     border: solid #323232;
                                     border-top-width: medium;
                                     border-right-width: medium;
                                     border-bottom-width: medium;
                                     border-left-width: medium;
                                     border-width: 1px 3px 5px;
                                     background-color: #705d8d;
                                     position: absolute;
                                     bottom: 0;
                                 }
                                 .plateform > .pokemon { width: 100px; height: 100px; background-position: center 75%; background-repeat: no-repeat; position: relative; }`;

                    const sheet = $('<style>').text(style);
                    $(`.outline-opts`).append(sheet);

                    const updateExamples = (e, s) => {
                        const pokemon = $(e).find('.pokemon');
                        outlinePokemon('background', pokemon, s);
                        $(`.outline-opts li.plateform`).each((i, f) => {
                            $(f).html(pokemon[i]);
                        });
                    }

                    const setEnabledUpdate = (e, s) => {
                        $(e).on('change', (f) => {
                            s['enabled'] = f.target.checked;
                            updateExamples(examples, s);
                        });
                        $(e).next('label').on('click', (f) => { $(e).click(); });
                    }

                    const setThicknessUpdate = (e, s) => {
                        $(e).on('input', (f) => {
                            s['thickness'] = $.isNumeric(f.target.value) ? f.target.value : 0;
                            updateExamples(examples, s);
                        });
                    }

                    const setColorUpdate = (e, s) => {
                        $(e).on('input', (f) => {
                            s['color'] = isValidColor(f.target.value) ? f.target.value : 'transparent';
                            updateExamples(examples, s);
                        });
                    }

                    const setColorWheelUpdate = (e, s) => {
                        $(e).on('input', (f) => {
                            const color = $(e).siblings('input[type="text"]');
                            $(color).val(f.target.value);
                            $(color).trigger('input');
                        });
                    }

                    // Add event listener for enabling or disabling entirely
                    $(`input[name='outline-enable']`).attr('checked', page_settings['general']['enabled']);
                    $(`input[name='outline-thickness']`).attr('value', page_settings['general']['thickness']);
                    $(`input[name='outline-color']`).attr('value', page_settings['general']['color']);
                    $(`input[name='outline-colorwheel']`).attr('value', page_settings['general']['color']);
                    $(`input[name='enable-per-page']`).attr('checked', page_settings['general']['advanced']);

                    $('.outline-opts #outline-page').html(examples);
                    updateExamples(examples, page_settings.general);

                    $('.outline-opts input[name="outline-enable"]').on('change', (e) => {
                        switch (e.target.checked) {
                            case true:
                                $(e.target).parent().parent().siblings().each((i, e) => {
                                    $(e).find('td').find('input').attr('disabled', false);
                                });
                                break;
                            case false:
                                $(e.target).parent().parent().siblings().each((i, e) => {
                                    $(e).find('td').find('input').attr('disabled', true);
                                });
                                break;
                        }
                    });
                    $('.outline-opts label[for="outline-enable"]').on('click', (e) => {
                        $(e.target).prev().click();
                    });

                    // Add event listener for general settings
                    setThicknessUpdate($('.outline-opts input[name="outline-thickness"]'), page_settings.general);
                    setColorUpdate($('.outline-opts input[name="outline-color"]'), page_settings.general);
                    setColorWheelUpdate($('.outline-opts input[name="outline-colorwheel"]'), page_settings.general);

                    // Add event listener for determining general or per-page settings
                    $('.outline-opts input[name="enable-per-page"]').on('change', (e) => {
                        switch (e.target.checked) {
                            case true:
                                page_settings.general.advanced = true;
                                $(e.target).parent().parent().after(perPageSettings);
                                addPageOptionUpdate();
                                break;
                            case false:
                                page_settings.general.advanced = false;
                                $(e.target).parent().parent().nextAll().each((i, e) => {
                                    if ($(e).find('#outline-page').length === 0) $(e).remove();
                                    $('.outline-opts #outline-page').html(examples);
                                    updateExamples(examples, page_settings.general);
                                });
                                break;
                        }
                    });
                    $('.outline-opts label[for="enable-per-page"]').on('click', (e) => {
                        $(e.target).next().click();
                    });

                    // Add event listener to update per-page settings displayed
                    const addPageOptionUpdate = () => {
                        $('.outline-opts select[name="outline-page"]').on('change', () => {
                            let selected = $('.outline-opts select[name="outline-page"]')[0].value;

                            $('.outline-opts #outline-page').html(
                                `<table style='width: 100%;'>
                                 <tr><td><h4>${page_layouts[selected]} Outline Settings</h4></td></tr>
                                 <tr><td><input type='checkbox' name='${selected}-outline-enable'><label for='${selected}-outline-enable'>${page_layouts[selected]} Outline Enable</label></td></tr>
                                 <tr><td><input type='number' name=${selected}-outline-thickness min=1 max=5><label for='${selected}-outline-thickness'>${page_layouts[selected]} Outline Thickness</label></td></tr>
                                 <tr><td><label for='${selected}-outline-color'>${page_layouts[selected]} Outline Color</label><input type='text' name='${selected}-outline-color' placeholder='#FFFFFF'><input type='color' name='${selected}-outline-colorwheel'></td></tr>
                                 <tr><td><h4>${page_layouts[selected]} Outline Examples</h4></td></tr>
                                 <tr><td><div id='${selected}-examples'><ul class='spritelist'>${examples}</ul></div></td></tr>
                                 </table>`
                            );

                            $(`input[name='${selected}-outline-enable']`).attr('checked', page_settings[selected]["enabled"]);
                            $(`input[name='${selected}-outline-thickness']`).attr('value', page_settings[selected]["thickness"]);
                            $(`input[name='${selected}-outline-color']`).attr('value', page_settings[selected]["color"]);
                            $(`input[name='${selected}-outline-colorwheel']`).attr('value', page_settings[selected]["color"]);
                            updateExamples(examples, page_settings[selected]);

                            setEnabledUpdate($(`.outline-opts input[name="${selected}-outline-enable"]`), page_settings[selected]);
                            setThicknessUpdate($(`.outline-opts input[name="${selected}-outline-thickness"]`), page_settings[selected]);
                            setColorUpdate($(`.outline-opts input[name="${selected}-outline-color"]`), page_settings[selected]);
                            setColorWheelUpdate($(`.outline-opts input[name="${selected}-outline-colorwheel"]`), page_settings[selected]);
                        });
                        $('.outline-opts select[name="outline-page"]').trigger('change');
                    };

                    // Silly way to add the page settings if it's checked by triggering an event listener...
                    $('.outline-opts input[name="enable-per-page"]').attr('checked') ? $('.outline-opts input[name="enable-per-page"]').trigger('change') : 0;
                })
            });
            button.insertBefore(e);
        }
    });

    function isValidColor(c) {
        const color = new Option().style;
        color.color = c;

        return color.color !== 'transparent' && color.color != '';
    }

    function outlinePokemon(t, e, s) {
        if (page_settings.general.advanced === true) {
            outline(t, e, s);
        } else if (page_settings.general.advanced === false) {
            outline(t, e, page_settings.general);
        } else {
            console.log("Here be dragons!");
        }
    }

    function start() {
        const callback = (mutations, obs) => {
            for (const mutation of mutations) {
                switch (page) {
                    case 'users':
                        if (mutation.type === 'attributes') {
                            if ($(mutation.target).attr('class') === 'tab-active') {
                                let pokemon = $(mutation.target).find('.egg, .pokemon');
                                outlinePokemon('background', pokemon, page_settings['users']);
                            }
                        }
                        break;
                    case 'fields':
                        for (const node of mutation.addedNodes) {
                            if ($(node).attr('class') == 'field') {
                                let pokemon = $(node).find('.fieldmon > img');
                                outlinePokemon('image', pokemon, page_settings['fields']);

                                pokemon = $(node).find('.pkmn > .pokemon');
                                outlinePokemon('background', pokemon, page_settings['party']);
                            }
                        }
                        break;
                    case 'shelter':
                        for (const node of mutation.addedNodes) {
                            if ($(node).attr('class') === 'pokemon') {
                                let pokemon = $(node).find('img');
                                outlinePokemon('image', pokemon, page_settings['shelter']);
                            }
                        }
                        break;
                    case 'lab':
                        if (mutation.type === 'childList') {
                            let pokemon = $(mutation.target).next('img');
                            outlinePokemon('image', pokemon, page_settings['lab']);
                        }
                        break;
                    case 'scour':
                        let pokemon = $(mutation.target);
                        outlinePokemon('background', pokemon, page_settings['scour']);
                }
            }
        }

        let pokemon;
        const config = { childList : true };
        const observer = new MutationObserver(callback);

        switch (page) {
            case 'party':
                pokemon = $.merge($('.pokemon'), $('.egg'));
                outlinePokemon('background', pokemon, page_settings['party']);
                break;
            case 'user':
                pokemon = $.merge($('.pokemon'), $('.egg'));
                outlinePokemon('background', pokemon, page_settings['user']);
                break;
            case 'scour':
                pokemon = $.merge($('.pokemon'), $('.egg'));
                outlinePokemon('background', pokemon, page_settings['scour']);
                break;
            case 'daycare':
                pokemon = $.merge($('.pokemon'), $('.egg'));
                outlinePokemon('background', pokemon, page_settings['daycare']);

                pokemon.each((i, e) => {
                    observer.observe($('.pokemon')[0], config);
                });
                break;
            case 'users':
                config.childList = false;
                config.attributes = true;
                let users = $('#multiuser > div');
                users.each((i, e) => {
                    observer.observe($(e)[0], config);
                });
                break;
            case 'fields':
                pokemon = $.merge($('.pokemon'), $('.egg'));
                outlinePokemon('background', pokemon, page_settings['party']);

                pokemon = $('#field_field > .field > .fieldmon > img');
                outlinePokemon('image', pokemon, page_settings['fields']);

                observer.observe($('#field_field')[0], config);
                break;
            case 'lab':
                config.characterData = true;
                pokemon = $('#egglist > div > h3');
                pokemon.each((i, e) => {
                    console.log($(e)[0]);
                    observer.observe($(e)[0], config);
                });
                break;
            case 'shelter':
                observer.observe($('#shelterarea')[0], config);
                break;
        }
    }

    function getSprite(url) {
        return new Promise((resolve, reject) => GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "Content-Type": "application/json"
            },
            responseType: "blob",
            dataType: "binary",
            onload: (response) => {
                const img = new Image();
                var reader = new FileReader();
                reader.readAsDataURL(response.response);
                reader.onloadend = () => {
                    var base64data = reader.result;
                    img.onload = () => {
                        resolve(img);
                    }
                    img.src = base64data;
                };
            }
        }));
    }

    // Takes a list of elements to find and replace images with outlined images
    function outline(type, elements, settings = { 'enabled' : false, 'thickness' : 1, 'color' : '#000000' }) {
        var patt=/\"|\'|\)|\(|url/g;

        // If settings are disabled why continue...
        if(!settings.enabled) return false;

        elements.each(async (i, e) => {
            var url = (type == 'background') ? $(e).css('background-image').replace(patt, '') : '';
            url = (type == 'image') ? $(e).attr('src').replace(patt, '') : url;

            const img = await getSprite(url);

            let canvas = $('<canvas/>');
            let data = draw(canvas, img, settings);

            if(!data) return;

            if (type == 'background') {
                $(e).css('background-image', `url('${data}')`);

                let cw = $(canvas).width();
                let ch = $(canvas).height();
                if ($(e).width() < cw) {
                    $(e).css('width', cw);

                    let x = (cw - 100) / 2;
                    $(e).css('margin-left', `-${x}px`);
                }
                if ($(e).height() < ch) {
                    $(e).css('height', ch);

                    let y = (ch - 100) / 2;
                    $(e).css('margin-top', `-${y}px`);
                }
            } else if (type == 'image') {
                $(e).attr('src', `${data}`);
            }
        });
    }

    function draw(canvas, img, settings) {
        if (!settings['enabled']) return false;

        let ctx = $(canvas)[0].getContext('2d');

        let dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1], // offset array
            s = Number(settings.thickness), // thickness scale
            i = 0, // iterator
            x = s, // final position
            y = s;

        let width = img.width + s * 2;
        let height = img.height + s * 2;
        $(canvas).css('width', width).attr('width', width);
        $(canvas).css('height', height).attr('height', height);

        // draw images at offsets from the array scaled by s
        for(; i < dArr.length; i += 2) {
            ctx.drawImage(img, x + dArr[i]*s, y + dArr[i+1]*s);
        }

        // fill with color
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = settings['color'];
        ctx.fillRect(0, 0, $(canvas).width(), $(canvas).height());

        // draw original image in normal mode
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(img, x, y);

        let data = $(canvas)[0].toDataURL('image/png');
        return data;
    }

    start();
});
