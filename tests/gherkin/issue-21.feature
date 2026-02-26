# Issue #21 - Know if my bag is going to be overweight before I pack
# As an expat, I want to see the estimated total weight of my shopping items
# so that I don't get hit with overweight baggage fees at the airport.

Feature: Luggage weight estimation
  As an expat traveler returning home from the USA
  I want to track the estimated weight and volume of my shopping items
  So that I can pack within airline baggage limits and avoid overweight fees

  Background:
    Given I am logged in as an expat traveler
    And I have a trip planned with status "upcoming"

  Scenario: View total estimated weight for a trip
    Given I have the following items on my trip shopping list:
      | name              | estimated_weight_lbs |
      | Vitamins bundle   | 2.5                  |
      | Protein bars box  | 3.0                  |
      | Running shoes     | 2.0                  |
      | Hot sauce 3-pack  | 1.5                  |
    When I view the trip packing summary
    Then I should see a total estimated weight of "9.0 lbs"
    And I should see the weight compared to the standard checked bag limit of "50 lbs"

  Scenario: Warning when items exceed baggage weight limit
    Given I have a checked bag limit of "50 lbs"
    And my trip items have a combined estimated weight of "52 lbs"
    When I view the trip packing summary
    Then I should see an overweight warning
    And the warning should indicate I am "2 lbs" over the limit
    And I should see a suggestion to split items across multiple bags

  Scenario: Weight stays within limit
    Given I have a checked bag limit of "50 lbs"
    And my trip items have a combined estimated weight of "44 lbs"
    When I view the trip packing summary
    Then I should see a "within limit" indicator
    And I should see I have "6 lbs" of remaining capacity

  Scenario: Add item with weight estimate
    Given I am on the shopping list page for my trip
    When I add a new item with:
      | field                | value         |
      | name                 | Cast iron pan |
      | estimated_weight_lbs | 8.0           |
      | category             | Kitchen       |
    Then the item should appear in my shopping list
    And the total estimated trip weight should update to reflect the new item

  Scenario: Mark item as purchased and update actual weight
    Given I have an item "Running shoes" with an estimated weight of "2.0 lbs"
    And the item status is "purchased"
    When I update the actual weight to "2.3 lbs"
    Then the packing summary should use the actual weight "2.3 lbs" instead of the estimate
    And the total weight display should update accordingly

  Scenario: Item without weight estimate is excluded from total
    Given I have an item "Misc toiletries" with no weight entered
    When I view the trip packing summary
    Then the item should appear in an "unweighed items" list
    And a note should remind me to add weight estimates for accurate totals

  Scenario: Estimate number of checked bags needed
    Given my trip items have a combined estimated weight of "95 lbs"
    And the checked bag limit is "50 lbs"
    When I view the packing summary
    Then I should see a recommendation of "2 checked bags"
    And I should see an approximate weight split across those bags
