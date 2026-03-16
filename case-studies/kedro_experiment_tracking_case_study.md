# Kedro — Experiment Tracking

## Overview

Kedro Experiment Tracking was a product design initiative focused on integrating experiment tracking and model performance capabilities directly into Kedro Viz.

Kedro is an open-source Python framework for creating reproducible, maintainable and modular data science code. It borrows concepts from software engineering and applies them to machine-learning workflows, including modularity, separation of concerns and versioning. Kedro is hosted by the Linux Foundation AI & Data.

The work emerged after PerformanceAI, a separate model performance and experiment tracking product designed at McKinsey, was sunset in 2020 due to business decisions and the market dominance of MLFlow.

At that point, engineers were already using PerformanceAI alongside Kedro, but they had to operate both products in separate tabs. The project focused on understanding that workflow in detail, identifying which capabilities were worth preserving and then embedding the most valuable functionality into Kedro’s native experience inside Kedro Viz.

## Role and Scope

As Principal Designer on Kedro, my broader responsibility included product leadership and vision, end-to-end product design, design direction and branding.

For this feature, the work was not only an interface design project. The scope included:

- discovery research
- creative ideation
- journey mapping
- observation and synthesis
- product strategy
- prioritisation
- interaction design
- user interviews
- requirements gathering
- concept validation
- prototyping
- usability testing
- user stories
- design system application
- design QA during delivery

The work sat inside a wider design leadership scope that also included:

- design leadership and vision for a team of 20
- design mentorship for a team of 4
- OKRs and metrics setting
- strategy and prioritisation with product and technical directors
- QA system implementation with engineering
- close collaboration with cross-functional teams and technical users from different disciplines

The project also involved planning workshops, cross-functional alignment and close collaboration with engineering through implementation.

## The Problem

Technical users were splitting critical workflow steps between Kedro and PerformanceAI.

This created friction across:

- context switching between tools
- duplicated mental models
- fragmented workflow continuity
- inconsistent access to experiment tracking and model performance insights
- reduced efficiency for technical users working across different seniority levels

The opportunity was to turn experiment tracking from a separate utility into a native part of Kedro Viz.

## Why It Mattered

PerformanceAI had been discontinued, but the underlying user need had not disappeared.

Engineers were already pairing PerformanceAI with Kedro in practice, which made the integration opportunity strategically important for three reasons:

- the workflow already existed
- the current experience was inefficient
- Kedro could absorb a high-value capability into its core product experience

This made the project both a usability improvement and a product strategy move.

It also mattered in the context of Kedro’s wider growth as an open-source product. In its early growth stage, Kedro was building a stronger community, enterprise adoption and internal visibility, which meant that improving core product capabilities had direct relevance for user adoption, product maturity and platform credibility.

## Discovery and Research

The project began with a dual-track discovery effort.

The team analyzed PerformanceAI usage data to understand:

- which features were most used
- which lower-usage features could be considered for phase-out
- which usage patterns should influence prioritisation

At the same time, a technical task was developed for key users so the team could observe real workflows in action.

This stage helped uncover:

- real behaviour instead of assumed behaviour
- technical barriers across the workflow
- how users moved between Kedro and PerformanceAI
- which capabilities were essential enough to justify native integration

## Planning and Alignment

Before broader discovery workshops began, a planning session was facilitated to align the team.

The planning covered:

- existing assumptions
- engineering prototype studies
- the current state of the codebase
- technical constraints and considerations
- roles and responsibilities through a RACI structure

This created a shared foundation before requirements and solution directions were defined.

## Key Insights

The discovery work produced several clear product signals:

- users were already stitching the workflow together themselves
- the problem was not feature absence, but workflow fragmentation
- not all PerformanceAI functionality needed to survive the transition
- the highest-value opportunity was to preserve the most useful capabilities inside Kedro’s native environment

The journey mapping and synthesis work helped clarify where friction happened, what users needed at each stage and where continuity broke down between systems.

## Product and Design Decisions

The project translated discovery into a set of clear decisions:

- integrate experiment tracking directly into Kedro Viz instead of maintaining a parallel-tool workflow
- prioritize the most valuable PerformanceAI capabilities rather than preserve the full product by default
- use research and usage data to support feature reduction and prioritisation decisions
- shape requirements through user journeys, workshops and validated user stories
- adapt the solution to engineering and codebase realities instead of designing in isolation

This made the work as much about product definition as interface design.

## Ideation and Validation

Workshops were run with internal and external users from different companies to explore:

- workflows
- tools used across the process
- team roles
- behaviours
- emotional drivers
- collaboration patterns

These workshops directly informed:

- requirements gathering
- user journeys
- assumption validation
- user stories
- prototype direction

The ideation phase was collaborative and iterative. Using workshop outputs, the team:

- defined the problem statement
- shared findings with the broader team
- explored directions through ideation
- prioritised concepts
- created and refined prototypes

Concepts were then improved through repeated validation loops with users.

## Delivery

Once the direction was defined, the focus shifted to implementation quality and cross-functional execution.

The delivery phase emphasized:

- design QA
- use of the design system
- close collaboration with engineering
- adapting designs to technical constraints
- active support through build

This ensured the feature translated into a polished and functional product, not just a well-framed concept.

## End-to-End Process Summary

The full process can be summarized as:

1. Analyze PerformanceAI usage data.
2. Observe technical workflows through assigned tasks.
3. Identify pain points, barriers and high-value features.
4. Map journeys and synthesize findings.
5. Align product, design and engineering through planning and RACI.
6. Run discovery workshops with internal and external users.
7. Gather requirements and validate assumptions.
8. Define the problem space and explore solutions collaboratively.
9. Prototype and validate iteratively with users.
10. Deliver the feature inside Kedro Viz with design QA and engineering collaboration.
11. Continue refining the feature through ongoing validation and iteration.

## Outcomes

### User Outcome

- Experiment tracking was successfully integrated into Kedro Viz.
- The result created a more seamless experience aligned with real workflows.
- The feature continued to improve through ongoing iteration and validation.

### Product Outcome

- Kedro absorbed a high-value capability into its native workflow.
- The integration strengthened Kedro Viz as a more complete product experience.
- The work supported Kedro’s long-term product development and ecosystem value.
- It reinforced Kedro’s positioning as a more capable framework for technical users working across pipelines, experimentation and model performance.

### Business Outcome

- Helped Kedro gain 10K GitHub stars and build presence in the open-source community.
- Average 25% yearly increase in active users.
- Average 22% yearly increase in client adoption.
- More than 200,000 monthly downloads.
- Over 100 contributors in the open-source community.
- Kedro is now used on thousands of client projects.
- A growing number of enterprises, including NASA, chose Kedro as their standard for data-science code.
- Kedro is quoted as a leading reason why technical talent is joining the firm.
- Kedro joined the Linux Foundation’s LF AI & Data incubator and launched a public roadmap.

## Awards and External Validation

- Fast Company Innovation by Design Award - Honour
- UK Technical Communication Award - Honour
- AI Award - Best Technical Tool or Framework for AI

## Lessons from the Project

This case reinforces a few product design lessons:

- workflow evidence is more useful than assumptions when defining product direction
- integration can be more valuable than feature expansion when users are already stitching tools together
- prioritisation often creates more value than preserving everything from a legacy product
- close collaboration with engineering is essential when product decisions depend on technical constraints
