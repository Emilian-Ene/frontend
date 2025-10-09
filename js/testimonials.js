// Horizontal scroll controls for testimonial cards
(function(){
  const scroller = document.querySelector('#reviewsScroller');
  const prev = document.querySelector('#reviewsPrev');
  const next = document.querySelector('#reviewsNext');
  if(!scroller) return;
  
  function scrollByDelta(dir){
    // Check if we're in horizontal scroll mode
    if(!scroller.classList.contains('overflow-x-auto')) return;
    
    const delta = Math.min(400, scroller.clientWidth * 0.8);
    scroller.scrollBy({left: dir * delta, behavior:'smooth'});
  }
  
  // Enhanced scroll function with better card detection
  function scrollToNextCard(direction) {
    if(!scroller.classList.contains('overflow-x-auto')) return;
    
    const cards = scroller.querySelectorAll('.card:not(.hidden)');
    const scrollLeft = scroller.scrollLeft;
    const containerWidth = scroller.clientWidth;
    
    let targetScroll = scrollLeft;
    
    if(direction > 0) {
      // Scroll right - find next card that's not fully visible
      for(let card of cards) {
        const cardLeft = card.offsetLeft;
        const cardRight = cardLeft + card.offsetWidth;
        
        if(cardLeft > scrollLeft + containerWidth - 50) {
          targetScroll = cardLeft - 20;
          break;
        }
      }
    } else {
      // Scroll left - find previous card
      for(let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];
        const cardLeft = card.offsetLeft;
        
        if(cardLeft < scrollLeft - 50) {
          targetScroll = cardLeft - 20;
          break;
        }
      }
    }
    
    scroller.scrollTo({left: targetScroll, behavior:'smooth'});
  }
  
  prev && prev.addEventListener('click', () => {
    scrollToNextCard(-1);
    // Fallback to simple scroll if card-based scroll doesn't work
    setTimeout(() => scrollByDelta(-1), 100);
  });
  
  next && next.addEventListener('click', () => {
    scrollToNextCard(1);
    // Fallback to simple scroll if card-based scroll doesn't work
    setTimeout(() => scrollByDelta(1), 100);
  });
})();

// "All Reviews" expand/collapse functionality
(function(){
  const allReviewsBtn = document.querySelector('#allReviewsBtn');
  const btnText = document.querySelector('#btnText');
  const btnIcon = document.querySelector('#btnIcon');
  const additionalReviews = document.querySelectorAll('.additional-review');
  const reviewsScroller = document.querySelector('#reviewsScroller');
  const navArrows = document.querySelectorAll('.nav-arrow');
  
  if(!allReviewsBtn || !additionalReviews.length || !reviewsScroller) return;
  
  let isExpanded = false;
  
  allReviewsBtn.addEventListener('click', function() {
    isExpanded = !isExpanded;
    
    if(isExpanded) {
      // Change to grid layout for expanded view
      reviewsScroller.style.transition = 'all 0.4s ease';
      reviewsScroller.classList.remove('flex', 'overflow-x-auto', 'snap-x', 'snap-mandatory');
      reviewsScroller.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
      reviewsScroller.style.gap = '1.5rem';
      reviewsScroller.style.overflow = 'visible';
      
      // Hide navigation arrows
      navArrows.forEach(arrow => {
        arrow.style.transition = 'opacity 0.3s ease';
        arrow.style.opacity = '0';
        arrow.style.pointerEvents = 'none';
      });
      
      // Remove scroll-specific styles from existing cards
      const existingCards = reviewsScroller.querySelectorAll('.card:not(.additional-review)');
      existingCards.forEach(card => {
        card.classList.remove('min-w-[300px]', 'max-w-sm', 'snap-start');
        card.style.transition = 'transform 0.3s ease';
      });
      
      // Show additional reviews with staggered animation
      additionalReviews.forEach((review, index) => {
        review.classList.remove('hidden', 'min-w-[300px]', 'max-w-sm', 'snap-start');
        review.style.opacity = '0';
        review.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
          review.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          review.style.opacity = '1';
          review.style.transform = 'translateY(0) scale(1)';
        }, index * 150 + 200); // Delay for grid transition + staggered effect
      });
      
    } else {
      // Revert to horizontal scroller
      reviewsScroller.style.transition = 'all 0.4s ease';
      reviewsScroller.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
      reviewsScroller.classList.add('flex', 'overflow-x-auto', 'snap-x', 'snap-mandatory');
      reviewsScroller.style.gap = '1rem';
      reviewsScroller.style.overflow = 'auto';
      
      // Show navigation arrows
      navArrows.forEach(arrow => {
        arrow.style.transition = 'opacity 0.3s ease';
        arrow.style.opacity = '1';
        arrow.style.pointerEvents = 'auto';
        arrow.style.display = 'flex'; // Ensure they're visible
      });
      
      // Restore scroll-specific styles to existing cards
      const existingCards = reviewsScroller.querySelectorAll('.card:not(.additional-review)');
      existingCards.forEach(card => {
        card.classList.add('min-w-[300px]', 'max-w-sm', 'snap-start');
      });
      
      // Hide additional reviews
      additionalReviews.forEach((review, index) => {
        review.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        review.style.opacity = '0';
        review.style.transform = 'translateY(-20px) scale(0.95)';
        
        setTimeout(() => {
          review.classList.add('hidden', 'min-w-[300px]', 'max-w-sm', 'snap-start');
        }, 300);
      });
    }
    
    // Update button text and icon
    if(isExpanded) {
      btnText.textContent = 'Show Less Reviews';
      btnIcon.style.transform = 'rotate(180deg)';
      
      // Smooth scroll to reveal new content after animation
      setTimeout(() => {
        allReviewsBtn.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 800);
    } else {
      btnText.textContent = 'Show All Reviews';
      btnIcon.style.transform = 'rotate(0deg)';
      
      // Scroll back to the reviews section
      setTimeout(() => {
        reviewsScroller.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }, 400);
    }
  });
})();
