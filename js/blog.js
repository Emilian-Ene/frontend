// Blog functionality

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize based on page
    if (window.location.pathname.includes('blog-post.html')) {
        initBlogPost();
    } else if (window.location.pathname.includes('blog.html')) {
        initBlogHome();
    }

    // Back to Top button functionality
    initBackToTop();
    
    // Mobile menu functionality
    initMobileMenu();

});

// ============================================
// BACK TO TOP BUTTON
// ============================================

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.pointerEvents = 'auto';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.pointerEvents = 'none';
            }
        });

        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============================================
// BLOG HOME PAGE FUNCTIONALITY
// ============================================

function initBlogHome() {
    
    // Check for category parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
        // Filter articles based on URL parameter and scroll to them
        setTimeout(() => {
            filterArticles(categoryParam);
            // Scroll to articles section with offset for sticky header
            setTimeout(() => {
                const articlesGrid = document.querySelector('.articles-grid');
                if (articlesGrid) {
                    const headerOffset = 100;
                    const elementPosition = articlesGrid.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }, 100);
    }
    
    // Search functionality
    const searchInput = document.getElementById('blog-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Category filter pills
    const categoryPills = document.querySelectorAll('.category-pill');
    categoryPills.forEach(pill => {
        pill.addEventListener('click', function() {
            // Remove active class from all pills
            categoryPills.forEach(p => p.classList.remove('active'));
            // Add active class to clicked pill
            this.classList.add('active');
            
            // Filter articles
            const category = this.getAttribute('data-category');
            filterArticles(category);
        });
    });

    // Sidebar category links
    const sidebarCategories = document.querySelectorAll('[data-category]');
    sidebarCategories.forEach(link => {
        if (!link.classList.contains('category-pill')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                
                // Update pills
                categoryPills.forEach(p => p.classList.remove('active'));
                const matchingPill = Array.from(categoryPills).find(p => p.getAttribute('data-category') === category);
                if (matchingPill) {
                    matchingPill.classList.add('active');
                }
                
                // Filter articles
                filterArticles(category);
                
                // Scroll to articles
                document.querySelector('.articles-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    });

    // Load More button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // In a real implementation, this would load more articles from the server
            this.textContent = 'No more articles';
            this.disabled = true;
            this.classList.add('opacity-50', 'cursor-not-allowed');
        });
    }

    // Newsletter form
    const newsletterForm = document.getElementById('sidebar-newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                alert('Thank you for subscribing! Newsletter integration coming soon.');
                emailInput.value = '';
            }
        });
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterArticles(category) {
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        const articleCategory = card.querySelector('.category-badge').textContent.trim();
        const categoryMap = {
            'all': '',
            'fundamentals': 'Trading Fundamentals',
            'risk': 'Risk Management',
            'psychology': 'Trading Psychology',
            'technical': 'Technical Analysis',
            'analytics': 'Analytics & Metrics',
            'strategies': 'Strategies',
            'tools': 'Tools & Software',
            'market': 'Market Insights'
        };
        
        if (category === 'all' || categoryMap[category] === articleCategory) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update active state for category filters
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.classList.remove('text-blue-400', 'font-semibold');
        filter.classList.add('text-slate-400');
        
        if (filter.dataset.category === category) {
            filter.classList.remove('text-slate-400');
            filter.classList.add('text-blue-400', 'font-semibold');
        }
    });
    
    // Update category pills at the top
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.remove('active');
        if (pill.dataset.category === category) {
            pill.classList.add('active');
        }
    });
}

// Helper function for sidebar category filtering
function filterByCategory(category) {
    filterArticles(category);
    // Scroll to articles section with offset for sticky header
    setTimeout(() => {
        const articlesGrid = document.querySelector('.articles-grid');
        if (articlesGrid) {
            const headerOffset = 100; // Offset for sticky header
            const elementPosition = articlesGrid.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, 100);
}

// ============================================
// BLOG POST PAGE FUNCTIONALITY
// ============================================

function initBlogPost() {
    // Get article slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleSlug = urlParams.get('article');
    
    if (articleSlug) {
        loadArticle(articleSlug);
    } else {
        // No article specified, redirect to blog home
        window.location.href = 'blog.html';
    }

    // Newsletter form
    const newsletterForm = document.getElementById('sidebar-newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                alert('Thank you for subscribing! Newsletter integration coming soon.');
                emailInput.value = '';
            }
        });
    }
}

function loadArticle(slug) {
    // In a real implementation, this would fetch from articles.json
    // For now, we'll use sample data based on slug
    const articles = {
        'risk-management-basics': {
            title: 'Mastering Risk Management: The Foundation of Successful Trading',
            category: 'Risk Management',
            date: 'December 20, 2024',
            readingTime: '8 min read',
            author: {
                name: 'Sarah Chen',
                bio: 'Professional trader and risk management specialist with over 10 years of experience in derivatives markets. Sarah has managed portfolios exceeding $50M and specializes in quantitative trading strategies.',
                avatar: 'SC'
            },
            tags: ['Risk Management', 'Position Sizing', 'Trading Strategy', 'Money Management'],
            content: `
                <h2>Why Risk Management is Critical</h2>
                <p>Risk management is the cornerstone of profitable trading. While many traders focus exclusively on finding the perfect entry points or developing complex technical analysis systems, the truth is that how you manage risk determines your long-term success far more than your win rate.</p>
                
                <p>Professional traders understand that preserving capital is more important than making profits. This might sound counterintuitive, but consider this: if you lose 50% of your account, you need a 100% gain just to break even. The mathematics of drawdowns makes it clear why risk management must be your first priority.</p>

                <h2>The 1-2% Rule</h2>
                <p>One of the most fundamental risk management rules is to never risk more than 1-2% of your total trading capital on a single trade. This simple rule ensures that even a series of consecutive losses won't significantly damage your account.</p>

                <blockquote>
                "Risk management is not about avoiding risk. It's about taking calculated risks that align with your trading strategy and capital preservation goals." - Van K. Tharp
                </blockquote>

                <h3>Calculating Your Position Size</h3>
                <p>To implement the 1-2% rule, you need to calculate your position size based on:</p>
                <ul>
                    <li><strong>Account Size:</strong> Your total trading capital</li>
                    <li><strong>Risk Per Trade:</strong> The percentage you're willing to lose (1-2%)</li>
                    <li><strong>Stop Loss Distance:</strong> The difference between your entry and stop loss</li>
                </ul>

                <p>The formula is straightforward:</p>
                <p><strong>Position Size = (Account Size × Risk %) / Stop Loss Distance</strong></p>

                <h2>Understanding Risk-Reward Ratios</h2>
                <p>A positive expectancy trading system requires favorable risk-reward ratios. Most professional traders aim for at least a 1:2 risk-reward ratio, meaning they target profits that are at least twice their potential loss.</p>

                <p>Here's why this matters: With a 1:2 risk-reward ratio, you only need to win 34% of your trades to break even. Win 40% of your trades, and you're profitable. This mathematical advantage gives you room for error and creates a buffer against inevitable losing streaks.</p>

                <h3>Setting Realistic Profit Targets</h3>
                <p>Your profit targets should be based on:</p>
                <ol>
                    <li>Market volatility and average true range (ATR)</li>
                    <li>Support and resistance levels</li>
                    <li>Historical price action patterns</li>
                    <li>Your trading timeframe</li>
                </ol>

                <h2>The Danger of Overtrading</h2>
                <p>Overtrading is one of the fastest ways to destroy your trading account. It often stems from emotional responses to losses or the desire to "make back" what you've lost. This revenge trading mentality leads to poor decision-making and excessive risk-taking.</p>

                <p>Signs you might be overtrading include:</p>
                <ul>
                    <li>Taking trades that don't meet your criteria</li>
                    <li>Increasing position sizes after losses</li>
                    <li>Trading too many instruments simultaneously</li>
                    <li>Feeling anxious or stressed about your trades</li>
                </ul>

                <h2>Using Stop Losses Effectively</h2>
                <p>Stop losses are your safety net. They should be placed at levels that invalidate your trade thesis, not just at arbitrary percentage points. Consider using:</p>

                <ul>
                    <li><strong>Technical Stop Losses:</strong> Based on support/resistance levels</li>
                    <li><strong>Volatility Stop Losses:</strong> Using ATR-based calculations</li>
                    <li><strong>Time Stop Losses:</strong> Exiting if the trade doesn't work within a specific timeframe</li>
                </ul>

                <h2>Diversification and Correlation</h2>
                <p>Don't put all your eggs in one basket. Diversifying across different instruments, markets, and strategies helps reduce portfolio risk. However, be aware of correlation - trading highly correlated assets doesn't provide true diversification.</p>

                <h3>Creating a Risk Management Plan</h3>
                <p>Your risk management plan should include:</p>
                <ol>
                    <li>Maximum risk per trade (1-2% of capital)</li>
                    <li>Maximum daily loss limit</li>
                    <li>Maximum drawdown limit</li>
                    <li>Position sizing methodology</li>
                    <li>Correlation limits across positions</li>
                    <li>Recovery protocols after losses</li>
                </ol>

                <h2>Conclusion</h2>
                <p>Risk management isn't glamorous, but it's what separates professional traders from gamblers. By implementing strict risk controls, using appropriate position sizing, and maintaining discipline, you create the foundation for long-term trading success.</p>

                <p>Remember: your goal isn't to win every trade - it's to manage your risk so well that losing trades don't significantly impact your capital. Master risk management, and profits will follow.</p>
            `,
            relatedArticles: ['position-sizing', 'trading-psychology', 'understanding-sqn']
        },
        'understanding-sqn': {
            title: 'Understanding System Quality Number (SQN)',
            category: 'Analytics & Metrics',
            date: 'December 18, 2024',
            readingTime: '6 min read',
            author: {
                name: 'Michael Rodriguez',
                bio: 'Quantitative analyst and algorithmic trading specialist. Michael develops automated trading systems and has published research on performance metrics and strategy evaluation.',
                avatar: 'MR'
            },
            tags: ['SQN', 'Performance Metrics', 'Trading Analytics', 'Strategy Evaluation'],
            content: `
                <h2>What is System Quality Number?</h2>
                <p>The System Quality Number (SQN), developed by Dr. Van K. Tharp, is a powerful metric for evaluating trading system performance. Unlike simple metrics like win rate or profit factor, SQN measures the quality and consistency of your trading edge.</p>
                
                <p>SQN answers a critical question: "How reliable is my trading system?" It does this by analyzing the expectancy of your trades relative to their variability.</p>

                <h2>The SQN Formula</h2>
                <p>The SQN is calculated as:</p>
                <p><strong>SQN = (Average R-Multiple / Standard Deviation of R-Multiples) × √Number of Trades</strong></p>

                <h3>Understanding R-Multiples</h3>
                <p>An R-multiple represents your profit or loss in terms of initial risk. If you risk $100 per trade:</p>
                <ul>
                    <li>A $200 profit = 2R</li>
                    <li>A $100 loss = -1R</li>
                    <li>A $50 profit = 0.5R</li>
                </ul>

                <h2>Interpreting SQN Scores</h2>
                <p>Dr. Tharp's SQN rating scale:</p>
                <ul>
                    <li><strong>1.6 - 1.9:</strong> Below average</li>
                    <li><strong>2.0 - 2.4:</strong> Average</li>
                    <li><strong>2.5 - 2.9:</strong> Good</li>
                    <li><strong>3.0 - 5.0:</strong> Excellent</li>
                    <li><strong>5.0 - 6.9:</strong> Superb</li>
                    <li><strong>7.0+:</strong> Holy Grail (extremely rare)</li>
                </ul>

                <h2>Why SQN Matters</h2>
                <p>SQN is valuable because it:</p>
                <ol>
                    <li>Normalizes performance across different account sizes</li>
                    <li>Accounts for both profitability and consistency</li>
                    <li>Allows comparison of different trading strategies</li>
                    <li>Considers the number of trading opportunities</li>
                </ol>

                <h2>Example Calculation</h2>
                <p>Let's say you have 30 trades with these R-multiples:</p>
                <ul>
                    <li>Average R-multiple: 0.5</li>
                    <li>Standard deviation: 1.2</li>
                    <li>Number of trades: 30</li>
                </ul>
                <p>SQN = (0.5 / 1.2) × √30 = 0.417 × 5.48 = <strong>2.28</strong></p>
                <p>This would be rated as an "Average" system.</p>

                <h2>Improving Your SQN</h2>
                <p>To improve your SQN score:</p>
                <ul>
                    <li>Increase your average R-multiple (better entries/exits)</li>
                    <li>Reduce variability (more consistent results)</li>
                    <li>Take more high-quality trades</li>
                    <li>Eliminate trades that don't meet your criteria</li>
                </ul>

                <h2>Limitations of SQN</h2>
                <p>While powerful, SQN has limitations:</p>
                <ul>
                    <li>Requires sufficient sample size (minimum 30 trades)</li>
                    <li>Doesn't account for drawdown duration</li>
                    <li>May not reflect real-world slippage and costs</li>
                </ul>

                <h2>Conclusion</h2>
                <p>The System Quality Number is an essential tool for any serious trader. By understanding and monitoring your SQN, you can objectively evaluate your trading performance and make data-driven improvements to your strategy.</p>
            `,
            relatedArticles: ['risk-management-basics', 'expectancy', 'monte-carlo']
        },
        'position-sizing': {
            title: 'Position Sizing: How Much Should You Risk Per Trade?',
            category: 'Risk Management',
            date: 'December 15, 2024',
            readingTime: '7 min read',
            author: {
                name: 'Sarah Chen',
                bio: 'Professional trader and risk management specialist with over 10 years of experience in derivatives markets.',
                avatar: 'SC'
            },
            tags: ['Position Sizing', 'Risk Management', 'Money Management'],
            content: `
                <h2>The Importance of Position Sizing</h2>
                <p>Position sizing is arguably the most important aspect of trading that most beginners completely ignore. You can have the best trading strategy in the world, but without proper position sizing, you'll eventually blow up your account.</p>

                <h2>Fixed Fractional Method</h2>
                <p>The most common position sizing method is the fixed fractional approach, where you risk a fixed percentage of your capital on each trade (typically 1-2%).</p>
                
                <h3>The Formula</h3>
                <p><strong>Position Size = (Account Equity × Risk %) / (Entry Price - Stop Loss Price)</strong></p>

                <h2>Kelly Criterion</h2>
                <p>The Kelly Criterion is a mathematical formula that determines the optimal position size to maximize long-term growth:</p>
                <p><strong>Kelly % = (Win Rate × Avg Win - Loss Rate × Avg Loss) / Avg Win</strong></p>

                <p>However, most traders use a fractional Kelly (25-50% of the calculated value) to reduce volatility.</p>

                <h2>Volatility-Based Sizing</h2>
                <p>Using ATR (Average True Range) for position sizing ensures you adjust for market volatility:</p>
                <ul>
                    <li>Calculate the ATR of your instrument</li>
                    <li>Determine your dollar risk per trade</li>
                    <li>Divide dollar risk by ATR to get position size</li>
                </ul>

                <h2>Common Mistakes</h2>
                <ul>
                    <li>Risking too much per trade (>2%)</li>
                    <li>Increasing position size after losses</li>
                    <li>Not accounting for correlation across positions</li>
                    <li>Ignoring maximum portfolio heat</li>
                </ul>

                <h2>Conclusion</h2>
                <p>Proper position sizing is what allows professional traders to survive drawdowns and compound their capital over time. Start with conservative sizing (1% risk per trade) and adjust as you gain experience.</p>
            `,
            relatedArticles: ['risk-management-basics', 'expectancy', 'trading-psychology']
        },
        'trading-psychology': {
            title: 'The Psychology of Trading: Overcoming Emotional Biases',
            category: 'Trading Psychology',
            date: 'December 12, 2024',
            readingTime: '9 min read',
            author: {
                name: 'Dr. Amanda Foster',
                bio: 'Trading psychologist and performance coach. Dr. Foster works with professional traders and hedge funds to optimize decision-making and emotional resilience.',
                avatar: 'AF'
            },
            tags: ['Trading Psychology', 'Emotional Control', 'Discipline', 'Behavioral Finance'],
            content: `
                <h2>The Psychological Challenges of Trading</h2>
                <p>Trading is 90% psychology and 10% strategy. You can have the best trading system in the world, but if you can't control your emotions, you'll fail.</p>

                <h2>Common Emotional Biases</h2>
                
                <h3>1. Loss Aversion</h3>
                <p>Humans feel the pain of losses approximately 2.5 times more intensely than the pleasure of equivalent gains. This leads traders to:</p>
                <ul>
                    <li>Hold losing positions too long</li>
                    <li>Cut winning positions too early</li>
                    <li>Avoid taking necessary risks</li>
                </ul>

                <h3>2. Confirmation Bias</h3>
                <p>We naturally seek information that confirms our existing beliefs and ignore contradictory evidence. In trading, this manifests as:</p>
                <ul>
                    <li>Cherry-picking data to support your position</li>
                    <li>Ignoring warning signs in your trades</li>
                    <li>Rationalizing poor decisions</li>
                </ul>

                <h3>3. Recency Bias</h3>
                <p>Giving more weight to recent events over historical data leads to:</p>
                <ul>
                    <li>Overconfidence after winning streaks</li>
                    <li>Excessive caution after losing streaks</li>
                    <li>Changing strategies too frequently</li>
                </ul>

                <h2>Overcoming Emotional Trading</h2>
                
                <h3>1. Develop a Trading Plan</h3>
                <p>A comprehensive trading plan removes emotion from decision-making. Your plan should include:</p>
                <ul>
                    <li>Entry criteria</li>
                    <li>Exit criteria (both profit targets and stop losses)</li>
                    <li>Position sizing rules</li>
                    <li>Risk management parameters</li>
                    <li>Maximum daily/weekly loss limits</li>
                </ul>

                <h3>2. Keep a Trading Journal</h3>
                <p>Document not just what you traded, but how you felt before, during, and after the trade. This helps identify emotional patterns.</p>

                <h3>3. Practice Mindfulness</h3>
                <p>Mindfulness meditation has been shown to improve emotional regulation and decision-making under stress. Even 10 minutes daily can make a significant difference.</p>

                <h2>The Role of Discipline</h2>
                <p>Discipline is the bridge between trading goals and accomplishment. It means:</p>
                <ul>
                    <li>Following your trading plan even when it's difficult</li>
                    <li>Taking losses when your system says to</li>
                    <li>Staying out of the market when there are no setups</li>
                    <li>Not revenge trading after losses</li>
                </ul>

                <blockquote>
                "The goal of a successful trader is to make the best trades. Money is secondary." - Alexander Elder
                </blockquote>

                <h2>Managing Fear and Greed</h2>
                <p>Fear and greed are the two dominant emotions in trading:</p>
                
                <h3>Fear Management</h3>
                <ul>
                    <li>Use proper position sizing to reduce anxiety</li>
                    <li>Accept that losses are part of trading</li>
                    <li>Focus on process, not outcomes</li>
                </ul>

                <h3>Greed Management</h3>
                <ul>
                    <li>Set realistic profit targets</li>
                    <li>Don't overtrade during winning streaks</li>
                    <li>Remember that the market will always be there tomorrow</li>
                </ul>

                <h2>Conclusion</h2>
                <p>Mastering trading psychology is a journey, not a destination. It requires constant self-awareness, discipline, and commitment to improvement. By understanding your emotional biases and implementing systems to counteract them, you can become a more consistent and profitable trader.</p>
            `,
            relatedArticles: ['risk-management-basics', 'position-sizing', 'expectancy']
        },
        'monte-carlo': {
            title: 'Monte Carlo Simulations for Trading Strategy Validation',
            category: 'Analytics & Metrics',
            date: 'December 10, 2024',
            readingTime: '8 min read',
            author: {
                name: 'Michael Rodriguez',
                bio: 'Quantitative analyst and algorithmic trading specialist. Michael develops automated trading systems and has published research on performance metrics.',
                avatar: 'MR'
            },
            tags: ['Monte Carlo', 'Backtesting', 'Risk Analysis', 'Strategy Validation'],
            content: `
                <h2>What is Monte Carlo Simulation?</h2>
                <p>Monte Carlo simulation is a statistical technique that uses random sampling to model the probability of different outcomes in a process that cannot be easily predicted due to the intervention of random variables.</p>

                <p>In trading, we use Monte Carlo simulations to understand the range of possible outcomes for our trading strategy by randomly reshuffling our historical trades.</p>

                <h2>Why Use Monte Carlo for Trading?</h2>
                <p>Traditional backtesting shows you one path your strategy took through historical data. But what if trades had occurred in a different order? Monte Carlo simulation helps answer:</p>
                <ul>
                    <li>What is the worst-case drawdown I might face?</li>
                    <li>What is the probability of a 20% drawdown?</li>
                    <li>How likely am I to achieve my profit target?</li>
                    <li>Is my strategy robust or just lucky?</li>
                </ul>

                <h2>How Monte Carlo Works in Trading</h2>
                <p>The process involves:</p>
                <ol>
                    <li><strong>Collect Trade Data:</strong> Gather your historical trade results (wins and losses)</li>
                    <li><strong>Random Sampling:</strong> Randomly shuffle the order of trades</li>
                    <li><strong>Calculate Metrics:</strong> Calculate equity curve, drawdown, returns for this sequence</li>
                    <li><strong>Repeat:</strong> Run thousands of simulations (typically 1,000-10,000)</li>
                    <li><strong>Analyze Results:</strong> Create probability distributions of outcomes</li>
                </ol>

                <h2>Key Metrics from Monte Carlo</h2>
                
                <h3>1. Maximum Drawdown Distribution</h3>
                <p>Instead of just one maximum drawdown from backtesting, Monte Carlo gives you a distribution:</p>
                <ul>
                    <li>Median maximum drawdown</li>
                    <li>95th percentile maximum drawdown</li>
                    <li>Worst-case maximum drawdown</li>
                </ul>

                <h3>2. Profit Distribution</h3>
                <p>See the range of possible profits:</p>
                <ul>
                    <li>Most likely profit range</li>
                    <li>Probability of positive returns</li>
                    <li>Best and worst case scenarios</li>
                </ul>

                <h3>3. Consecutive Loss Distribution</h3>
                <p>Understand how many consecutive losses you might face to prepare psychologically and financially.</p>

                <h2>Implementing Monte Carlo in Python</h2>
                <p>Here's a basic implementation:</p>
                <pre><code>import numpy as np
import pandas as pd

def monte_carlo_simulation(trades, num_simulations=10000):
    results = []
    
    for _ in range(num_simulations):
        # Randomly shuffle trades
        shuffled = np.random.choice(trades, len(trades), replace=True)
        
        # Calculate equity curve
        equity = np.cumsum(shuffled)
        
        # Calculate metrics
        max_dd = np.min(equity - np.maximum.accumulate(equity))
        final_return = equity[-1]
        
        results.append({
            'final_return': final_return,
            'max_drawdown': max_dd
        })
    
    return pd.DataFrame(results)

# Example usage
trades = [100, -50, 200, -80, 150, -30, ...]  # Your R-multiples
results = monte_carlo_simulation(trades)
print(results.describe())</code></pre>

                <h2>Interpreting Results</h2>
                <p>After running your simulation:</p>
                <ul>
                    <li>Look at the 95th percentile drawdown - this is what you should prepare for</li>
                    <li>Check the probability of positive returns - should be > 95% for a robust strategy</li>
                    <li>Examine the distribution shape - is it normally distributed or skewed?</li>
                </ul>

                <h2>Common Pitfalls</h2>
                <p>Be aware of these limitations:</p>
                <ul>
                    <li><strong>Assumes independence:</strong> Real trades may have serial correlation</li>
                    <li><strong>Historical data only:</strong> Can't account for regime changes</li>
                    <li><strong>Doesn't model market impact:</strong> Assumes you can always execute at your price</li>
                </ul>

                <h2>Conclusion</h2>
                <p>Monte Carlo simulation is a powerful tool for understanding the true risk of your trading strategy. By seeing the range of possible outcomes rather than just one backtest result, you can make more informed decisions about position sizing, leverage, and risk management.</p>

                <p>Remember: the goal isn't to predict the future, but to understand the range of possible futures so you can prepare accordingly.</p>
            `,
            relatedArticles: ['understanding-sqn', 'backtesting', 'risk-management-basics']
        },
        'expectancy': {
            title: 'Trading Expectancy: The Key Metric for Long-Term Success',
            category: 'Trading Fundamentals',
            date: 'December 8, 2024',
            readingTime: '6 min read',
            author: {
                name: 'James Peterson',
                bio: 'Veteran trader with 15 years of experience in futures and forex markets. James specializes in systematic trading and quantitative analysis.',
                avatar: 'JP'
            },
            tags: ['Expectancy', 'Trading Metrics', 'Profitability', 'Strategy Evaluation'],
            content: `
                <h2>What is Expectancy?</h2>
                <p>Expectancy is the average amount you can expect to win (or lose) per trade. It's arguably the most important metric for evaluating a trading strategy because it tells you whether your edge is positive or negative.</p>

                <h2>The Expectancy Formula</h2>
                <p><strong>Expectancy = (Win Rate × Average Win) - (Loss Rate × Average Loss)</strong></p>

                <h3>Example Calculation</h3>
                <p>Let's say you have the following statistics:</p>
                <ul>
                    <li>Win Rate: 60%</li>
                    <li>Average Win: $300</li>
                    <li>Loss Rate: 40%</li>
                    <li>Average Loss: $150</li>
                </ul>
                <p>Expectancy = (0.60 × 300) - (0.40 × 150) = 180 - 60 = <strong>$120 per trade</strong></p>

                <h2>Why Expectancy Matters More Than Win Rate</h2>
                <p>Many traders obsess over win rate, but it's not the full picture. You can have a 90% win rate and still lose money if your average loss is much larger than your average win.</p>

                <h3>Scenario Comparison</h3>
                <p><strong>Trader A:</strong></p>
                <ul>
                    <li>Win Rate: 90%</li>
                    <li>Average Win: $10</li>
                    <li>Average Loss: $100</li>
                    <li>Expectancy = (0.90 × 10) - (0.10 × 100) = -$1</li>
                </ul>

                <p><strong>Trader B:</strong></p>
                <ul>
                    <li>Win Rate: 40%</li>
                    <li>Average Win: $200</li>
                    <li>Average Loss: $100</li>
                    <li>Expectancy = (0.40 × 200) - (0.60 × 100) = $20</li>
                </ul>

                <p>Trader B has a lower win rate but a positive expectancy, while Trader A will lose money over time despite winning 90% of trades!</p>

                <h2>Improving Your Expectancy</h2>
                <p>There are only four ways to improve expectancy:</p>
                <ol>
                    <li><strong>Increase Win Rate:</strong> Better entries, improved timing</li>
                    <li><strong>Increase Average Win:</strong> Let profits run, better exits</li>
                    <li><strong>Decrease Loss Rate:</strong> More selective trade criteria</li>
                    <li><strong>Decrease Average Loss:</strong> Tighter stops, quicker exits on losers</li>
                </ol>

                <h2>Expectancy vs. Expected Value</h2>
                <p>When you factor in the frequency of trading opportunities, you get Expected Value:</p>
                <p><strong>Expected Value = Expectancy × Number of Opportunities</strong></p>

                <p>A strategy with $100 expectancy but only 10 trades per year gives you $1,000 expected annual profit. A strategy with $50 expectancy but 100 trades per year gives you $5,000 expected annual profit.</p>

                <h2>Minimum Expectancy Threshold</h2>
                <p>Your expectancy needs to be positive after accounting for:</p>
                <ul>
                    <li>Trading commissions</li>
                    <li>Slippage</li>
                    <li>Data costs</li>
                    <li>Platform fees</li>
                    <li>Taxes</li>
                </ul>

                <p>A good rule of thumb: aim for expectancy of at least 0.5R (where R is your initial risk per trade).</p>

                <h2>Tracking Your Expectancy</h2>
                <p>Monitor your expectancy over time:</p>
                <ul>
                    <li>Calculate rolling 30-trade expectancy</li>
                    <li>Compare across different market conditions</li>
                    <li>Track by instrument, timeframe, and setup type</li>
                    <li>Look for deterioration in edge</li>
                </ul>

                <h2>Conclusion</h2>
                <p>Expectancy is the fundamental measure of whether your trading strategy has an edge. Focus on building and maintaining positive expectancy, and the profits will follow. Remember: consistent small edges compounded over many trades is how professional traders make money.</p>
            `,
            relatedArticles: ['understanding-sqn', 'risk-management-basics', 'position-sizing']
        },
        'backtesting': {
            title: 'Backtesting Best Practices: Avoiding Common Pitfalls',
            category: 'Tools & Software',
            date: 'December 5, 2024',
            readingTime: '10 min read',
            author: {
                name: 'Michael Rodriguez',
                bio: 'Quantitative analyst and algorithmic trading specialist. Michael develops automated trading systems and has published research on performance metrics.',
                avatar: 'MR'
            },
            tags: ['Backtesting', 'Strategy Development', 'Data Analysis', 'Overfitting'],
            content: `
                <h2>The Importance of Proper Backtesting</h2>
                <p>Backtesting is the process of testing a trading strategy using historical data to see how it would have performed. While essential for strategy development, improper backtesting can lead to false confidence and real money losses.</p>

                <h2>Common Backtesting Pitfalls</h2>

                <h3>1. Look-Ahead Bias</h3>
                <p>Look-ahead bias occurs when your backtest uses information that wouldn't have been available at the time of the trade. Examples include:</p>
                <ul>
                    <li>Using next day's opening price for today's decision</li>
                    <li>Calculating indicators with future data points</li>
                    <li>Rebalancing using end-of-period data</li>
                </ul>

                <h3>2. Survivorship Bias</h3>
                <p>Testing only on stocks that still exist today ignores all the companies that went bankrupt or were delisted. This makes your strategy look better than it really is.</p>

                <h3>3. Curve Fitting (Overfitting)</h3>
                <p>Optimizing parameters until you get excellent backtest results usually means you've fit your strategy to random noise rather than genuine patterns. The strategy will fail in live trading.</p>

                <h3>4. Cherry Picking</h3>
                <p>Only testing on favorable time periods, instruments, or market conditions gives a distorted view of strategy performance.</p>

                <h2>Best Practices for Robust Backtesting</h2>

                <h3>1. Use Quality Data</h3>
                <ul>
                    <li>Adjusted for corporate actions (splits, dividends)</li>
                    <li>Includes all instruments (delisted + active)</li>
                    <li>Accounts for bid-ask spreads</li>
                    <li>Contains sufficient history (minimum 10 years recommended)</li>
                </ul>

                <h3>2. Account for Transaction Costs</h3>
                <p>Include realistic estimates for:</p>
                <ul>
                    <li>Commissions</li>
                    <li>Slippage (typically 0.05-0.1% per trade)</li>
                    <li>Market impact (for larger positions)</li>
                    <li>Financing costs for overnight positions</li>
                </ul>

                <h3>3. Use Out-of-Sample Testing</h3>
                <p>Divide your data into three parts:</p>
                <ul>
                    <li><strong>Training Set (50%):</strong> Develop and optimize strategy</li>
                    <li><strong>Validation Set (25%):</strong> Test different parameter combinations</li>
                    <li><strong>Test Set (25%):</strong> Final verification on unseen data</li>
                </ul>

                <h3>4. Walk-Forward Analysis</h3>
                <p>Instead of optimizing on all historical data:</p>
                <ol>
                    <li>Optimize on a fixed window (e.g., 2 years)</li>
                    <li>Test forward for a period (e.g., 6 months)</li>
                    <li>Re-optimize on the next window</li>
                    <li>Repeat throughout your dataset</li>
                </ol>

                <h2>Key Metrics to Track</h2>
                <p>Beyond total return, examine:</p>
                <ul>
                    <li><strong>Maximum Drawdown:</strong> Largest peak-to-trough decline</li>
                    <li><strong>Sharpe Ratio:</strong> Risk-adjusted returns</li>
                    <li><strong>Profit Factor:</strong> Gross profits / Gross losses</li>
                    <li><strong>Win Rate:</strong> Percentage of winning trades</li>
                    <li><strong>Average Win/Loss:</strong> Average size of wins vs. losses</li>
                    <li><strong>Expectancy:</strong> Expected value per trade</li>
                    <li><strong>Number of Trades:</strong> Statistical significance</li>
                </ul>

                <h2>Statistical Significance</h2>
                <p>A backtest needs enough trades for statistical confidence:</p>
                <ul>
                    <li>Minimum 30 trades (preferably 100+)</li>
                    <li>Test across different market conditions</li>
                    <li>Verify consistency across time periods</li>
                    <li>Use Monte Carlo simulation to assess robustness</li>
                </ul>

                <h2>Warning Signs of Invalid Backtests</h2>
                <p>Be skeptical if you see:</p>
                <ul>
                    <li>Sharpe ratio > 3 (extremely rare in real trading)</li>
                    <li>Very few trades with very high win rate</li>
                    <li>Performance that's too good to be true</li>
                    <li>Strategy works perfectly in backtest but fails immediately in live trading</li>
                </ul>

                <h2>Code Example: Simple Backtest Framework</h2>
                <pre><code>class Backtest:
    def __init__(self, data, initial_capital=100000):
        self.data = data
        self.capital = initial_capital
        self.positions = []
        self.trades = []
    
    def run(self, strategy):
        for i, row in self.data.iterrows():
            # Generate signal
            signal = strategy.generate_signal(row, self.positions)
            
            # Execute trade
            if signal:
                self.execute_trade(signal, row)
        
        return self.calculate_metrics()
    
    def execute_trade(self, signal, row):
        # Account for slippage and commissions
        slippage = 0.001
        commission = 0.001
        
        price = row['close'] * (1 + slippage if signal > 0 else 1 - slippage)
        cost = abs(signal) * price * commission
        
        # Execute and record
        self.positions.append({
            'entry_price': price,
            'size': signal,
            'entry_date': row.name
        })
        self.capital -= cost</code></pre>

                <h2>Conclusion</h2>
                <p>Backtesting is both an art and a science. While it can't guarantee future performance, proper backtesting helps you avoid obvious pitfalls and develop realistic expectations. Always remember: the goal of backtesting is not to create a perfect equity curve, but to understand how your strategy behaves under various conditions.</p>

                <p>Test conservatively, account for all costs, use out-of-sample data, and always remain skeptical of results that seem too good to be true.</p>
            `,
            relatedArticles: ['monte-carlo', 'understanding-sqn', 'expectancy']
        }
    };

    const article = articles[slug];
    
    if (!article) {
        // Article not found
        document.getElementById('article-content').innerHTML = '<p class="text-red-400">Article not found.</p>';
        return;
    }

    // Update page title and meta
    document.title = article.title + ' - TOPC Blog';
    
    // Extract clean description from content
    const cleanDescription = article.content.substring(0, 160).replace(/<[^>]*>/g, '').trim() + '...';
    
    // Update basic meta tags
    document.getElementById('post-title').textContent = article.title + ' - TOPC Blog';
    document.getElementById('post-meta-title').setAttribute('content', article.title + ' - TOPC Blog');
    document.getElementById('post-description').setAttribute('content', cleanDescription);
    document.getElementById('post-keywords').setAttribute('content', article.tags.join(', '));
    document.getElementById('post-author').setAttribute('content', article.author.name);
    
    // Get article URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleSlug = urlParams.get('article');
    const articleUrl = `https://topc-trading.com/blog-post.html?article=${articleSlug}`;
    
    // Update canonical URL
    document.getElementById('canonical-url').setAttribute('href', articleUrl);
    
    // Update Open Graph tags
    document.getElementById('og-url').setAttribute('content', articleUrl);
    document.getElementById('og-title').setAttribute('content', article.title);
    document.getElementById('og-description').setAttribute('content', cleanDescription);
    document.getElementById('article-author').setAttribute('content', article.author.name);
    document.getElementById('article-section').setAttribute('content', article.category);
    
    // Update Twitter Card tags
    document.getElementById('twitter-url').setAttribute('content', articleUrl);
    document.getElementById('twitter-title').setAttribute('content', article.title);
    document.getElementById('twitter-description').setAttribute('content', cleanDescription);
    
    // Update header
    document.getElementById('breadcrumb-title').textContent = article.category;
    document.getElementById('post-category').textContent = article.category;
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('post-date').innerHTML = `<i class="far fa-calendar"></i> ${article.date}`;
    document.getElementById('post-reading-time').innerHTML = `<i class="far fa-clock"></i> ${article.readingTime}`;
    document.getElementById('post-author').innerHTML = `<i class="far fa-user"></i> ${article.author.name}`;
    
    // Update content
    document.getElementById('article-content').innerHTML = article.content;
    
    // Enhance code blocks with copy button
    enhanceCodeBlocks();
    
    // Generate Table of Contents
    generateTableOfContents();
    
    // Update tags
    const tagsContainer = document.getElementById('article-tags');
    tagsContainer.innerHTML = article.tags.map(tag => 
        `<span class="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm">${tag}</span>`
    ).join('');
    
    // Update author bio
    document.getElementById('author-avatar').textContent = article.author.avatar;
    document.getElementById('author-name').textContent = article.author.name;
    document.getElementById('author-bio').textContent = article.author.bio;
    
    // Highlight current article's category
    highlightCurrentCategory(article.category);
    
    // Load related articles
    loadRelatedArticles(article.relatedArticles, articles);
}

function highlightCurrentCategory(categoryName) {
    // Map category names to category data attributes
    const categoryMap = {
        'Trading Fundamentals': 'fundamentals',
        'Risk Management': 'risk',
        'Trading Psychology': 'psychology',
        'Technical Analysis': 'technical',
        'Analytics & Metrics': 'analytics',
        'Strategies': 'strategies',
        'Tools & Software': 'tools',
        'Market Insights': 'market'
    };
    
    const categorySlug = categoryMap[categoryName];
    
    if (categorySlug) {
        // Remove highlight from all categories
        document.querySelectorAll('.category-link').forEach(link => {
            link.classList.remove('text-blue-400', 'font-semibold');
            link.classList.add('text-slate-400');
        });
        
        // Highlight the current category
        const currentCategoryLink = document.querySelector(`.category-link[data-category="${categorySlug}"]`);
        if (currentCategoryLink) {
            currentCategoryLink.classList.remove('text-slate-400');
            currentCategoryLink.classList.add('text-blue-400', 'font-semibold');
        }
    }
}

function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.blog-post-content pre code');
    
    codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        
        // Detect language (simple detection based on content)
        let language = 'Code';
        const codeText = codeBlock.textContent;
        
        if (codeText.includes('def ') || codeText.includes('import ') || codeText.includes('class ') && codeText.includes(':')) {
            language = 'Python';
        } else if (codeText.includes('function') || codeText.includes('const ') || codeText.includes('let ')) {
            language = 'JavaScript';
        } else if (codeText.includes('SELECT') || codeText.includes('FROM')) {
            language = 'SQL';
        }
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'code-block-header';
        
        // Language label
        const langLabel = document.createElement('span');
        langLabel.className = 'code-language';
        langLabel.textContent = language;
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        };
        
        header.appendChild(langLabel);
        header.appendChild(copyBtn);
        
        // Wrap the pre element
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
    });
}

function generateTableOfContents() {
    const content = document.getElementById('article-content');
    const headings = content.querySelectorAll('h2, h3');
    const tocList = document.getElementById('toc-list');
    
    if (headings.length === 0) {
        document.getElementById('table-of-contents').style.display = 'none';
        return;
    }
    
    tocList.innerHTML = '';
    
    headings.forEach((heading, index) => {
        // Add ID to heading for linking
        const id = `heading-${index}`;
        heading.id = id;
        
        // Create TOC link
        const li = document.createElement('li');
        if (heading.tagName === 'H3') {
            li.style.paddingLeft = '1rem';
        }
        
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        li.appendChild(link);
        tocList.appendChild(li);
    });
}

function loadRelatedArticles(relatedSlugs, allArticles) {
    const container = document.getElementById('related-articles');
    
    // Image mapping for articles
    const articleImages = {
        'risk-management-basics': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
        'understanding-sqn': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop',
        'position-sizing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        'trading-psychology': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
        'monte-carlo': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        'expectancy': 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=300&fit=crop',
        'backtesting': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    };
    
    container.innerHTML = relatedSlugs.map(slug => {
        const article = allArticles[slug];
        if (!article) return '';
        
        return `
            <article class="article-card" onclick="window.location.href='blog-post.html?article=${slug}'">
                <div class="article-image">
                    <img src="${articleImages[slug] || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop'}" alt="${article.title}">
                    <span class="category-badge">${article.category}</span>
                </div>
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p class="article-excerpt">${article.content.substring(0, 150).replace(/<[^>]*>/g, '')}...</p>
                    <div class="article-footer">
                        <span class="text-slate-500 text-sm"><i class="far fa-calendar"></i> ${article.date}</span>
                        <span class="read-more">Read More <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function shareArticle(platform) {
    const url = window.location.href;
    const title = document.getElementById('article-title').textContent;
    
    let shareUrl;
    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy link. Please copy it manually: ' + url);
    });
}

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}
