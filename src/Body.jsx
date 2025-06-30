import React, { useState } from 'react';
import './Body.css'
function Body() {
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [timerInput, setTimerInput] = useState('');
  const [timeLimit, setTimeLimit] = useState(null);
  const [recipeTitles, setRecipeTitles] = useState([]);
  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState({});
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState({});
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);

  function handleIngredientChange(e) {
    setIngredient(e.target.value);
  }

  function addIngredient() {
    if (ingredient.trim() !== '') {
      setIngredients(prev => [...prev, ingredient]);
      setIngredient('');
      setError('');
      setShowRetryButton(false);
    }
  }

  function handleTimerChange(e) {
    setTimerInput(e.target.value);
  }

  function updateTimeLimit() {
    const time = parseInt(timerInput);
    if (time && time > 0) {
      setTimeLimit(time);
      setTimerInput('');
      setError('');
      setShowRetryButton(false);
    } else {
      setError('Please enter a valid time limit in minutes');
    }
  }

  // Helper function to handle API errors and determine retry strategy
  function handleApiError(error, response = null) {
    console.error('API Error:', error);
    
    if (response) {
      if (response.status === 503) {
        setError('🤖 AI service is starting up. Please wait 30 seconds and try again.');
        setShowRetryButton(true);
        return;
      } else if (response.status === 429) {
        setError('⏰ Too many requests. Please wait a few minutes before trying again.');
        setShowRetryButton(true);
        return;
      }
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      setError('🌐 Connection error. Please check your internet and try again.');
    } else if (error.message.includes('temporarily unavailable')) {
      setError('⚡ AI service is temporarily busy. Please try again in a moment.');
    } else {
      setError(`❌ ${error.message || 'Something went wrong. Please try again.'}`);
    }
    
    setShowRetryButton(true);
  }

  async function getRecipeTitles(isRetry = false) {
    if (!isRetry) {
      setRetryCount(0);
    }
    
    setLoadingRecipes(true);
    setRecipeTitles([]);
    setSelectedRecipeDetails({});
    setError('');
    setShowRetryButton(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/get-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, timeLimit }),
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(new Error(data.error || 'Failed to generate recipes'), response);
        return;
      }

      console.log('Received recipes:', data.recipes);
      
      if (data.recipes && data.recipes.length > 0) {
        const validRecipes = data.recipes.filter(recipe => 
          recipe && 
          typeof recipe === 'string' && 
          recipe.trim().length > 0
        );
        
        if (validRecipes.length > 0) {
          setRecipeTitles(validRecipes);
          setRetryCount(0);
          setError(''); // Clear any previous errors on success
        } else {
          setError('🍳 No valid recipes were generated. Please try different ingredients.');
          setShowRetryButton(true);
        }
      } else {
        setError('🤔 No recipes were generated. Please try again with different ingredients.');
        setShowRetryButton(true);
      }
      
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingRecipes(false);
    }
  }

  async function getFullRecipe(title) {
    setLoadingDetails(prev => ({ ...prev, [title]: true }));
    
    try {
      const response = await fetch('http://localhost:5000/api/get-full-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ingredients, timeLimit }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recipe details');
      }

      console.log('Received recipe steps for', title, ':', data.steps);
      
      setSelectedRecipeDetails(prev => ({
        ...prev,
        [title]: data.steps,
      }));
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.message.includes('temporarily unavailable') 
        ? '⚡ AI service is busy. Try again in a moment.'
        : `❌ ${error.message}`;
      
      setSelectedRecipeDetails(prev => ({
        ...prev,
        [title]: `${errorMessage}\n\n🔄 Click "View Full Recipe" to try again.`,
      }));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [title]: false }));
    }
  }

  function toggleRecipeDetails(title) {
    if (selectedRecipeDetails[title]) {
      // If details are already loaded, hide them
      const newDetails = { ...selectedRecipeDetails };
      delete newDetails[title];
      setSelectedRecipeDetails(newDetails);
    } else {
      // If details not loaded, fetch them
      getFullRecipe(title);
    }
  }

  function removeIngredient(indexToRemove) {
    setIngredients(prev => prev.filter((_, index) => index !== indexToRemove));
  }

  function clearAll() {
    setIngredients([]);
    setTimeLimit(null);
    setRecipeTitles([]);
    setSelectedRecipeDetails({});
    setError('');
    setRetryCount(0);
    setShowRetryButton(false);
  }

  function retryRequest() {
    setRetryCount(prev => prev + 1);
    getRecipeTitles(true);
  }

  return (
    <>
      <div className="body-container">
        <input
          type="text"
          placeholder="Enter ingredient"
          className="ingredient-input"
          name="ingredient"
          value={ingredient}
          onChange={handleIngredientChange}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
        />
        <button type="button" className="add-button" onClick={addIngredient}>
          + Add Ingredient
        </button>

        <input
          type="number"
          placeholder="Enter time limit (in mins)"
          className="time-input"
          name="timeLimit"
          value={timerInput}
          onChange={handleTimerChange}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), updateTimeLimit())}
        />
        <button type="button" className="add-button" onClick={updateTimeLimit}>
          + Set Time Limit
        </button>
      </div>

      {/* Enhanced Error Display */}
      {error && (
        <div style={{
          margin: '20px auto',
          maxWidth: '600px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e57373',
          textAlign: 'center',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          <div style={{ marginBottom: showRetryButton ? '15px' : '0' }}>
            {error}
          </div>
          {showRetryButton && (
            <button
              onClick={retryRequest}
              disabled={loadingRecipes}
              style={{
                backgroundColor: loadingRecipes ? '#ccc' : '#f44336',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: loadingRecipes ? 'not-allowed' : 'pointer',
                opacity: loadingRecipes ? 0.6 : 1,
                fontSize: '0.95rem',
                fontFamily: 'Poppins, sans-serif',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!loadingRecipes) e.target.style.backgroundColor = '#d32f2f';
              }}
              onMouseLeave={(e) => {
                if (!loadingRecipes) e.target.style.backgroundColor = '#f44336';
              }}
            >
              {loadingRecipes ? '🔄 Retrying...' : `🔄 Retry${retryCount > 0 ? ` (Attempt ${retryCount + 1})` : ''}`}
            </button>
          )}
        </div>
      )}

      {(ingredients.length > 0 || timeLimit) && (
        <div className="output-container">
          {ingredients.length > 0 && (
            <div className="ingredients-list">
              <h3>Ingredients:</h3>
              <ul>
                {ingredients.map((item, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {item}
                    <button 
                      onClick={() => removeIngredient(index)}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginLeft: '10px'
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {timeLimit && (
            <p className="time-limit">Time limit: {timeLimit} mins</p>
          )}

          {(ingredients.length > 0 || timeLimit) && (
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button 
                onClick={clearAll}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                🗑️ Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {ingredients.length > 0 && timeLimit && (
        <div className="get-recipe-section">
          <h3>Get Your Recipe now</h3>
          <button 
            className="get-recipe-button" 
            onClick={() => getRecipeTitles(false)}
            disabled={loadingRecipes}
            style={{
              backgroundColor: loadingRecipes ? '#95a5a6' : '#1ABC9C',
              cursor: loadingRecipes ? 'not-allowed' : 'pointer',
              opacity: loadingRecipes ? 0.8 : 1
            }}
          >
            {loadingRecipes ? '🤖 AI is generating recipes...' : '🍳 Get Recipe Ideas'}
          </button>
          
          {/* Additional tip for users */}
          {!loadingRecipes && recipeTitles.length === 0 && (
            <p style={{ 
              marginTop: '10px', 
              fontSize: '0.9rem', 
              color: '#7f8c8d',
              fontStyle: 'italic'
            }}>
              💡 Tip: The AI might take a moment to respond. If it fails, try the retry button!
            </p>
          )}
        </div>
      )}

      {recipeTitles.length > 0 && (
        <div className="recipe-cards">
          {recipeTitles.map((title, idx) => (
            <div className="recipe-card" key={idx}>
              <h4>{title}</h4>
              <button 
                onClick={() => toggleRecipeDetails(title)}
                disabled={loadingDetails[title]}
                style={{
                  backgroundColor: loadingDetails[title] ? '#95a5a6' : '#1ABC9C',
                  cursor: loadingDetails[title] ? 'not-allowed' : 'pointer',
                  opacity: loadingDetails[title] ? 0.8 : 1
                }}
              >
                {loadingDetails[title] 
                  ? '🤖 AI is writing recipe...' 
                  : selectedRecipeDetails[title] 
                    ? '🙈 Hide Recipe' 
                    : '👁️ View Full Recipe'
                }
              </button>
              {selectedRecipeDetails[title] && (
                <div className="recipe-details">
                  <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {selectedRecipeDetails[title]}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Body;