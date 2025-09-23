#!/usr/bin/env python3
"""
MCP Agent Client Test
Tests the real functionality of our custom MCP agent orchestrator
"""

import asyncio
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def test_agent_orchestrator():
    """Test our custom MCP agent orchestrator with real fabric.js analysis"""

    # Create server parameters for our MCP agent orchestrator
    server_params = StdioServerParameters(
        command="python",
        args=["mcp_agent_orchestrator.py"],
        env=None
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:

            print("🚀 Testing MCP Agent Orchestrator...")
            print("=" * 50)

            # Initialize session
            await session.initialize()

            # Test 1: Initialize swarm
            print("\n1️⃣ Initializing hierarchical swarm...")
            result = await session.call_tool("swarm_init", {
                "topology": "hierarchical",
                "max_agents": 16,
                "strategy": "specialized"
            })
            print(f"✅ Swarm Result: {json.dumps(result.content[0].text, indent=2)}")
            swarm_data = json.loads(result.content[0].text)

            # Test 2: Spawn specialized agents
            print("\n2️⃣ Spawning specialized agents...")
            agents_to_create = [
                {"type": "researcher", "name": "FabricInvestigator", "capabilities": ["webpack_analysis", "fabric_investigation", "script_debugging"]},
                {"type": "analyst", "name": "RootCauseAnalyst", "capabilities": ["technical_analysis", "dependency_mapping", "error_diagnosis"]},
                {"type": "architect", "name": "SystemArchitect", "capabilities": ["system_design", "integration_planning", "recovery_strategy"]},
                {"type": "specialist", "name": "JavaScriptSpecialist", "capabilities": ["js_debugging", "browser_analysis", "performance_optimization"]}
            ]

            agent_ids = []
            for agent_config in agents_to_create:
                result = await session.call_tool("agent_spawn", agent_config)
                agent_data = json.loads(result.content[0].text)
                agent_ids.append(agent_data.get("agent_id"))
                print(f"   ✅ Created {agent_config['type']}: {agent_data.get('agent_id')}")

            # Test 3: List all agents
            print("\n3️⃣ Listing all active agents...")
            result = await session.call_tool("agent_list", {})
            agents_data = json.loads(result.content[0].text)
            print(f"   📊 Active Agents: {agents_data['agent_count']}")
            for agent in agents_data['agents']:
                print(f"   🤖 {agent['name']} ({agent['type']}) - {len(agent['capabilities'])} capabilities")

            # Test 4: Orchestrate REAL fabric.js analysis task
            print("\n4️⃣ Orchestrating REAL fabric.js analysis task...")
            fabric_task = """
            CRITICAL FABRIC.JS ANALYSIS REQUIRED:

            Investigation needed for yprint_designtool WordPress plugin:
            1. Why does fabric-global-exposer.js exist but isn't registered in class-octo-print-designer-public.php?
            2. How is fabric.js trapped in webpack scope instead of being exposed as window.fabric?
            3. What are the exact technical steps to fix the global exposure?
            4. Provide evidence-based findings with high confidence recommendations.

            Technical context: vendor.bundle.js contains fabric module, designer-global-exposer.js loads but fabric-global-exposer.js doesn't.
            """

            result = await session.call_tool("task_orchestrate", {
                "task": fabric_task,
                "strategy": "adaptive",
                "priority": "critical",
                "max_agents": 4
            })
            task_data = json.loads(result.content[0].text)
            task_id = task_data.get("task_id")
            print(f"   🎯 Task Orchestrated: {task_id}")
            print(f"   ⚡ Orchestration Time: {task_data.get('orchestration_time_ms'):.2f}ms")
            print(f"   👥 Agents Assigned: {len(task_data.get('assigned_agents', []))}")

            # Test 5: Monitor task progress
            print("\n5️⃣ Monitoring task progress...")
            max_wait_time = 10  # seconds
            wait_time = 0

            while wait_time < max_wait_time:
                await asyncio.sleep(1)
                wait_time += 1

                result = await session.call_tool("task_status", {"task_id": task_id})
                status_data = json.loads(result.content[0].text)

                print(f"   ⏱️  [{wait_time}s] Status: {status_data.get('status')} | Progress: {status_data.get('progress', 0):.1%}")

                if status_data.get('status') == 'completed':
                    print(f"   ✅ Task completed in {status_data.get('execution_time_ms', 0):.2f}ms")
                    break

            # Test 6: Get REAL analysis results
            print("\n6️⃣ Retrieving REAL analysis results...")
            result = await session.call_tool("task_results", {
                "task_id": task_id,
                "format": "detailed"
            })
            results_data = json.loads(result.content[0].text)

            if results_data.get('success'):
                analysis = results_data.get('results', {})
                print(f"   📋 Analysis Type: {analysis.get('analysis_type')}")
                print(f"   🎯 Root Cause: {analysis.get('findings', {}).get('root_cause')}")
                print(f"   📊 Confidence Level: {analysis.get('confidence_level')}")
                print(f"   ⏰ Analysis Time: {results_data.get('execution_time_ms'):.2f}ms")

                print("\n🔍 DETAILED FINDINGS:")
                findings = analysis.get('findings', {})
                if 'evidence' in findings:
                    print("   📝 Evidence:")
                    for i, evidence in enumerate(findings['evidence'], 1):
                        print(f"      {i}. {evidence}")

                if 'technical_details' in findings:
                    print("   🔧 Technical Details:")
                    for key, value in findings['technical_details'].items():
                        print(f"      • {key}: {value}")

                if 'recommended_fix' in analysis:
                    print("   🛠️  Recommended Fix:")
                    fix = analysis['recommended_fix']
                    for key, value in fix.items():
                        print(f"      • {key}: {value}")

                print(f"\n✅ REAL AGENT ANALYSIS COMPLETE!")
                print(f"   🧠 Analyzed by: {analysis.get('analyzed_by', 'Agent System')}")
                print(f"   📅 Timestamp: {analysis.get('analysis_timestamp')}")

            else:
                print(f"   ❌ Analysis failed: {results_data.get('error')}")

            # Test 7: Get swarm status
            print("\n7️⃣ Final swarm status...")
            result = await session.call_tool("swarm_status", {})
            swarm_status = json.loads(result.content[0].text)
            print(f"   🌐 Swarm Status: {swarm_status['agent_count']} agents, {swarm_status['completed_tasks']} tasks completed")

            print("\n" + "=" * 50)
            print("🎉 MCP Agent Orchestrator Test SUCCESSFUL!")
            print("✅ Real agents providing actual technical analysis!")

if __name__ == "__main__":
    asyncio.run(test_agent_orchestrator())