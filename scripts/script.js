jQuery(document).ready(function() {

	jQuery.jMaskGlobals.translation['9'] = '';
	jQuery('[data-mask]').each(function(index, element) { jQuery(element).mask(jQuery(element).data('mask')) });

	jQuery('[data-scroll]').on('click', function(event) {
		if (jQuery(this).is('a')) event.preventDefault();

		var target = jQuery(jQuery(this).data('scroll'));

		jQuery('html, body').animate({
			scrollTop: target.offset().top
		}, 500);
	});

	jQuery('data-click').on('click', function(event) {
		if (jQuery(this).is('a')) event.preventDefault();

		var target = jQuery(jQuery(this).data('click'));

		jQuery(this).toggleClass('active');

		jQuery(target).toggle();
	});

	jQuery('[data-validity]').on('invalid', function(event) {
		event.target.setCustomValidity(jQuery(event.target).data('validity'));
	}).on('change', function(event) {
		jQuery('[name=' + event.target.name + ']').each(function(index, element) {
			element.setCustomValidity('');
		});
	}).on('input', function(event) {
		event.target.setCustomValidity('');
	});

	if (window.navigator.userAgent.search(/ios|safari/i) > -1 && window.navigator.userAgent.search(/chrome|opera/i)) {
		jQuery('input, select, textarea').on('invalid', function(event) {

			var height = 150;
			var input = event.target;
			var form = event.target.form;

			console.log(jQuery(input).offset().top - height, jQuery(document).scrollTop());

			if (jQuery(input).offset().top - height < jQuery(document).scrollTop()) {
				jQuery(document).scrollTop(jQuery(input).offset().top - height);

				if (!form.reValidity) {
					form.reValidity = true;

					setTimeout(function(form) {
						form.reportValidity();
					}, 100, form);

					setTimeout(function(form) {
						form.reValidity = false;
					}, 500, form);
				}
			}
		});
	}

	jQuery('#phone').ajaxForm({
		'beforeSerialize': function() {
			grecaptcha.execute('6LehDGAUAAAAAJoqkx-oc6W-KeapSBCr2veF3Mwd', {action: 'submit'}).then(function(token) {
				jQuery('[name=captcha]').val(token);
			}, function(error) {
				console.log('grecaptcha error', error);
			});
		},
		'beforeSubmit': function(arr, form) {
			jQuery(form).find('[data-pattern]').each(function(index, element) { if (jQuery(element).val().search(jQuery(element).data('pattern') > -1)) return false });
			jQuery(form).find('[type-submit]').prop('disabled', true);
		},
		'success': function(data) {
			if (data == 'valid') {
				jQuery('#gen').addClass('none');
				jQuery('#check').removeClass('none');
			} else {
				jQuery('#gen').addClass('none');
				jQuery('#error').removeClass('none');
				jQuery('#message').text(data);
			}
		},
		'error': function() {
			jQuery('#gen').addClass('none');
			jQuery('#error').removeClass('none');
		}
	});

	jQuery('#key').ajaxForm({
		'beforeSerialize': function() {
			jQuery('[form=phone]').attr('form', 'key');
		},
		'beforeSubmit': function(arr, form) {
			jQuery(form).find('[data-pattern]').each(function(index, element) { if (jQuery(element).val().search(jQuery(element).data('pattern') > -1)) return false });
			jQuery(form).find('[type-submit]').prop('disabled', true);
		},
		'success': function(data) {
			if (data == 'valid') {
				jQuery('#check').addClass('none');
				jQuery('#success').removeClass('none');
				window.location.hash = 'success';
			} else {
				jQuery('#check').addClass('none');
				jQuery('#error').removeClass('none');
				jQuery('#message').text(data);
			}
		},
		'error': function() {
			jQuery('#check').addClass('none');
			jQuery('#error').removeClass('none');
		}
	});

	jQuery('[name=is_new_client][value=true]').on('change', function() {
		jQuery('#new').removeClass('none');
		jQuery('#old').addClass('none');
	});

	jQuery('[name=is_new_client][value=""]').on('change', function() {
		jQuery('#new').addClass('none');
		jQuery('#old').removeClass('none');
	});

	if (window.navigator.userAgent.search(/android/i) > -1) {
		jQuery('.ios').css('display', 'none');
		jQuery('.android').css('display', '');
	}

	if (window.navigator.userAgent.search(/iphone|ipod|ipad/i) > -1) {
		jQuery('.ios').css('display', '');
		jQuery('.android').css('display', 'none');
	}

	jQuery('[data-slider]').each(function(index, element) {
		jQuery(element).on('mousedown', function(event) {
			element.dragged = true;
			element.drag = event.pageX;
		});

		jQuery(element).on('mousemove', function(event) {
			if ((event.buttons > 0) && (element.dragged)) {
				element.scrollLeft = element.scrollLeft - (event.pageX - element.drag);
				element.drag = event.pageX;
			}
		});

		jQuery(element).on('mouseup', function(event) {
			element.dragged = false;
		});

		jQuery(element).on('mouseleave', function(event) {
			element.dragged = false;
		});

		jQuery(element).on('scroll', function(event) {
			var slides = jQuery(element).children();
			var min_offset = element.scrollWidth;
			var min_slide_index = 0;
			slides.each(function(index_slide, slide) {
				var slide_offset = element.scrollLeft - slide.offsetLeft;
				if (Math.abs(min_offset) > Math.abs(slide_offset)) {
					min_offset = slide_offset;
					min_slide_index = index_slide;
				}
			});
			if (jQuery(element).data('sliderNav')) {
				var nav = jQuery(jQuery(element).data('sliderNav'));
				if (nav.length) {
					nav.children().removeClass('active');
					nav.children().eq(min_slide_index).addClass('active');
				}
			}
		});
	});
});

grecaptcha.ready(function() {
	grecaptcha.execute('6LehDGAUAAAAAJoqkx-oc6W-KeapSBCr2veF3Mwd', {action: 'ready'}).then(function(token) {
		document.querySelector('[name=captcha]').value = token;
	}, function(error) {
		console.log('grecaptcha error', error);
	});
});

new WOW().init();