document.addEventListener("DOMContentLoaded", () => {
    // Unit Selection
    const unitRadios = document.querySelectorAll("input[name=\"unit\"]");
    const metricInputs = document.getElementById("metric-inputs");
    const imperialInputs = document.getElementById("imperial-inputs");

    // Input Fields
    const weightKgInput = document.getElementById("weight-kg");
    const heightCmInput = document.getElementById("height-cm");
    const weightLbsInput = document.getElementById("weight-lbs");
    const heightFtInput = document.getElementById("height-ft");
    const heightInInput = document.getElementById("height-in");
    const ageInput = document.getElementById("age");
    const genderRadios = document.querySelectorAll("input[name=\"gender\"]");

    // Buttons
    const calculateBtn = document.getElementById("calculate-btn");

    // Result Displays
    const bmiResultSection = document.getElementById("result-bmi");
    const calorieResultSection = document.getElementById("result-calories");
    const bmiScoreSpan = document.getElementById("bmi-score");
    const bmiCategorySpan = document.getElementById("bmi-category");
    const bmrResultSpan = document.getElementById("bmr-result");
    const tdeeResultsDiv = document.getElementById("tdee-results");

    // Activity Level Multipliers
    const activityLevels = {
        "Sedentary (little/no exercise)": 1.2,
        "Moderately Active (3-5 days/week)": 1.55,
        "Very Active (6-7 days/week)": 1.725
    };

    // Function to switch between unit input fields
    function switchUnitInputs() {
        const selectedUnit = document.querySelector("input[name=\"unit\"]:checked").value;
        if (selectedUnit === "metric") {
            metricInputs.style.display = "block";
            imperialInputs.style.display = "none";
        } else {
            metricInputs.style.display = "none";
            imperialInputs.style.display = "block";
        }
        clearInputs();
        clearResults();
    }

    // Add event listeners to unit radio buttons
    unitRadios.forEach(radio => {
        radio.addEventListener("change", switchUnitInputs);
    });

    // Function to clear input fields
    function clearInputs() {
        weightKgInput.value = "";
        heightCmInput.value = "";
        weightLbsInput.value = "";
        heightFtInput.value = "";
        heightInInput.value = "";
        ageInput.value = "";
        // Keep gender selection
    }

    // Function to clear result displays
    function clearResults() {
        bmiScoreSpan.textContent = "-";
        bmiCategorySpan.textContent = "-";
        bmrResultSpan.textContent = "-";
        tdeeResultsDiv.innerHTML = ""; // Clear TDEE results
        bmiResultSection.style.display = "block"; // Show BMI section by default
        calorieResultSection.style.display = "none"; // Hide calorie section
        bmiScoreSpan.style.color = "#007bff";
        bmiCategorySpan.style.color = "#555";
    }

    // Function to determine BMI category and color
    function getBmiCategory(bmi) {
        let category = "";
        let color = "#555";
        if (bmi < 18.5) { category = "Underweight"; color = "#3498db"; }
        else if (bmi < 25) { category = "Healthy"; color = "#2ecc71"; }
        else if (bmi < 30) { category = "Overweight"; color = "#f1c40f"; }
        else if (bmi < 35) { category = "Obese"; color = "#e67e22"; }
        else { category = "Extremely Obese"; color = "#e74c3c"; }
        return { category, color };
    }

    // Function to calculate BMR using Mifflin-St Jeor equation
    function calculateBMR(weightKg, heightCm, age, gender) {
        let bmr;
        if (gender === "male") {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        } else { // female
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        }
        return Math.round(bmr);
    }

    // Function to calculate TDEE
    function calculateTDEE(bmr, activityMultiplier) {
        return Math.round(bmr * activityMultiplier);
    }

    // Main calculation function
    function calculateAll() {
        clearResults(); // Clear previous results first
        const selectedUnit = document.querySelector("input[name=\"unit\"]:checked").value;
        const age = parseInt(ageInput.value);
        const gender = document.querySelector("input[name=\"gender\"]:checked").value;
        let weightKg, heightCm, weightLbs, heightFt, heightIn, totalHeightInches;
        let bmi, bmr;

        try {
            // --- Validate Age and Gender ---
            if (isNaN(age) || age <= 0) {
                throw new Error("Please enter a valid positive age.");
            }
            if (!gender) {
                 throw new Error("Please select a gender."); // Should not happen with default
            }

            // --- Get Weight and Height based on units ---
            if (selectedUnit === "metric") {
                weightKg = parseFloat(weightKgInput.value);
                heightCm = parseFloat(heightCmInput.value);
                if (isNaN(weightKg) || isNaN(heightCm) || weightKg <= 0 || heightCm <= 0) {
                    throw new Error("Please enter valid positive numbers for metric weight and height.");
                }
            } else { // Imperial
                weightLbs = parseFloat(weightLbsInput.value);
                heightFt = parseFloat(heightFtInput.value) || 0;
                heightIn = parseFloat(heightInInput.value) || 0;
                if (isNaN(weightLbs) || isNaN(heightFt) || isNaN(heightIn) || weightLbs <= 0 || (heightFt <= 0 && heightIn <= 0) || heightFt < 0 || heightIn < 0) {
                    throw new Error("Please enter valid positive numbers for imperial weight and height.");
                }
                totalHeightInches = (heightFt * 12) + heightIn;
                if (totalHeightInches <= 0) {
                   throw new Error("Please enter a valid positive imperial height.");
                }
                // Convert imperial to metric for BMR calculation
                weightKg = weightLbs / 2.20462;
                heightCm = totalHeightInches * 2.54;
            }

            // --- Calculate BMI ---
            const heightMeters = heightCm / 100;
            bmi = weightKg / (heightMeters * heightMeters);
            if (isNaN(bmi) || !isFinite(bmi)) {
                 throw new Error("BMI calculation error. Please check inputs.");
            }
            bmiScoreSpan.textContent = bmi.toFixed(1);
            const { category, color } = getBmiCategory(bmi);
            bmiCategorySpan.textContent = category;
            bmiCategorySpan.style.color = color;
            bmiResultSection.style.display = "block";

            // --- Calculate BMR --- 
            bmr = calculateBMR(weightKg, heightCm, age, gender);
            if (isNaN(bmr) || bmr <= 0) {
                throw new Error("BMR calculation error. Please check inputs.");
            }
            bmrResultSpan.textContent = bmr;

            // --- Calculate and Display TDEE for different activity levels ---
            tdeeResultsDiv.innerHTML = ""; // Clear previous TDEE results
            for (const level in activityLevels) {
                const tdee = calculateTDEE(bmr, activityLevels[level]);
                const deficit = tdee - 500;
                const surplus = tdee + 500;

                const levelDiv = document.createElement("div");
                levelDiv.innerHTML = `
                    <strong>${level}:</strong> ${tdee} kcal/day<br>
                    <span>Weight Loss Target: <span class="deficit">&lt; ${deficit}</span> kcal | Weight Gain Target: <span class="surplus">&gt; ${surplus}</span> kcal</span>
                `;
                tdeeResultsDiv.appendChild(levelDiv);
            }
            calorieResultSection.style.display = "block"; // Show calorie results

        } catch (error) {
            // Display error in a user-friendly way (e.g., in the result section)
            // For simplicity, using alert for now, but better UI feedback is recommended
            alert("Error: " + error.message);
            clearResults(); // Clear potentially partial results
        }
    }

    // Add event listener to the calculate button
    calculateBtn.addEventListener("click", calculateAll);

    // Initial setup
    switchUnitInputs(); // Set initial visibility based on default checked radio
    clearResults(); // Ensure results are clear on load
});
