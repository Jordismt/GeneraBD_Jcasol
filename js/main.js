let entityCount = 0;
let relations = [];
const allowedChars = /^[a-zA-Z0-9_]+$/; // Solo permite letras, números y guiones bajos

// Función para añadir una nueva entidad
function addEntity() {
    entityCount++;
    const entityContainer = document.createElement('div');
    entityContainer.classList.add('entity');
    entityContainer.setAttribute('id', `entity-${entityCount}`);

    entityContainer.innerHTML = `
        <div class="entity-header">
            <input type="text" id="entity-name-${entityCount}" placeholder="Nombre de la Entidad" onblur="validateEntityName(${entityCount})">
            <div>
                <button class="btn" onclick="addAttribute(${entityCount})">Añadir Atributo</button>
                <button class="btn btn-red" onclick="removeEntity(${entityCount})">Eliminar Entidad</button>
            </div>
        </div>
        <div id="attributes-container-${entityCount}">
            <!-- Aquí se agregarán los atributos -->
        </div>
    `;

    document.getElementById('entities-container').appendChild(entityContainer);
    updateRelationSelectors();
    checkEntitiesForRelations();
}

function validateEntityName(entityId) {
    const input = document.getElementById(`entity-name-${entityId}`);
    const name = input.value.trim();
    const existingNames = [...document.querySelectorAll('input[id^="entity-name-"]')]
        .map(e => e.value.trim());

    if (!allowedChars.test(name)) {
        alert('El nombre solo puede contener letras, números y guiones bajos.');
        input.value = '';
    } else if (existingNames.filter(n => n === name).length > 1) {
        alert('El nombre de la entidad debe ser único.');
        input.value = '';
    }
}

// Función para añadir un atributo a una entidad
function addAttribute(entityId) {
    const entityNameInput = document.getElementById(`entity-name-${entityId}`);
    if (!entityNameInput.value.trim()) {
        alert('Por favor, asigna un nombre a la entidad antes de añadir atributos.');
        return;
    }

    const attributesContainer = document.getElementById(`attributes-container-${entityId}`);
    const attributeCount = attributesContainer.querySelectorAll('.attribute').length;

    const attribute = document.createElement('div');
    attribute.classList.add('attribute');
    attribute.innerHTML = `
        <input type="text" placeholder="Nombre del atributo" id="attribute-${entityId}-${attributeCount}" onblur="validateAttributeName(${entityId}, ${attributeCount})">
        <select onchange="updateDataTypeVisibility(${entityId}, ${attributeCount})">
            <option value="INT">INT</option>
            <option value="FLOAT">FLOAT</option>
            <option value="VARCHAR">VARCHAR</option>
            <option value="TEXT">TEXT</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="DATE">DATE</option>
            <option value="JSON">JSON</option>
        </select>
        <input type="number" min="1" placeholder="Longitud" id="length-${entityId}-${attributeCount}" style="width: 80px; display: none;">
        <div style="display: flex; align-items: center;">
            <label for="primary-key-${entityId}-${attributeCount}" >Clave Primaria</label>
            <input type="checkbox" id="primary-key-${entityId}-${attributeCount}" />
        </div>
        <button class="btn" onclick="removeAttribute(this)">Eliminar</button>
    `;

    attributesContainer.appendChild(attribute);
    updateRelationSelectors(); // Actualizar los selectores de relaciones
}

function validateAttributeName(entityId, attributeCount) {
    const input = document.getElementById(`attribute-${entityId}-${attributeCount}`);
    const name = input.value.trim();

    if (!allowedChars.test(name)) {
        alert('El nombre solo puede contener letras, números y guiones bajos.');
        input.value = '';
    }
}

function updateDataTypeVisibility(entityId, attributeCount) {
    const select = document.querySelector(`#attributes-container-${entityId} .attribute select`);
    const lengthInput = document.getElementById(`length-${entityId}-${attributeCount}`);
    lengthInput.style.display = select.value === 'VARCHAR' ? 'inline' : 'none';
}

// Función para eliminar un atributo
function removeAttribute(button) {
    const attributeDiv = button.closest('.attribute'); // Usamos closest para encontrar el padre correcto
    if (attributeDiv) {
        attributeDiv.remove(); // Eliminar el div del atributo
    }
    
    updateRelationSelectors(); // Actualizar los selectores de relaciones
}

// Función para eliminar una entidad
function removeEntity(entityId) {
    document.getElementById(`entity-${entityId}`).remove();
    updateRelationSelectors();
    checkEntitiesForRelations();
}

// Función para añadir una relación entre dos entidades
function addRelation() {
    const entity1 = document.getElementById('relation-entity-1').value;
    const attribute1 = document.getElementById('relation-attribute-1').value;
    const entity2 = document.getElementById('relation-entity-2').value;
    const attribute2 = document.getElementById('relation-attribute-2').value;

    if (entity1 && entity2 && attribute1 && attribute2) {
        relations.push({ entity1, attribute1, entity2, attribute2 });
        alert(`Relación añadida entre ${entity1}.${attribute1} y ${entity2}.${attribute2}`);
    } else {
        alert('Por favor, selecciona entidades y atributos válidos para definir una relación.');
    }
}

// Actualiza los selectores de entidades y atributos para definir relaciones
function updateRelationSelectors() {
    const relationEntity1 = document.getElementById('relation-entity-1');
    const relationEntity2 = document.getElementById('relation-entity-2');
    const relationAttribute1 = document.getElementById('relation-attribute-1');
    const relationAttribute2 = document.getElementById('relation-attribute-2');

    // Limpiar los selectores
    relationEntity1.innerHTML = '<option value="">Seleccionar Entidad 1</option>';
    relationEntity2.innerHTML = '<option value="">Seleccionar Entidad 2</option>';
    relationAttribute1.innerHTML = '<option value="">Seleccionar Atributo de Entidad 1</option>';
    relationAttribute2.innerHTML = '<option value="">Seleccionar Atributo de Entidad 2</option>';

    // Llenar con nuevas entidades
    for (let i = 1; i <= entityCount; i++) {
        const entityNameInput = document.getElementById(`entity-name-${i}`);
        if (!entityNameInput) continue;
        const entityName = entityNameInput.value.trim();

        // Agregar entidades
        const option1 = document.createElement('option');
        option1.value = `entity-${i}`;
        option1.textContent = entityName;
        relationEntity1.appendChild(option1);

        // Clonar para la segunda entidad
        const option2 = option1.cloneNode(true);
        relationEntity2.appendChild(option2);
    }

    // Actualizar atributos según la entidad seleccionada
    relationEntity1.onchange = function() {
        updateAttributeSelector(relationAttribute1, this.value);
    };
    relationEntity2.onchange = function() {
        updateAttributeSelector(relationAttribute2, this.value);
    };

    // Actualizar atributos de los selectores
    updateAttributeSelector(relationAttribute1, relationEntity1.value);
    updateAttributeSelector(relationAttribute2, relationEntity2.value);
}

// Función para actualizar el selector de atributos según la entidad seleccionada
function updateAttributeSelector(attributeSelect, entityValue) {
    attributeSelect.innerHTML = '<option value="">Seleccionar Atributo</option>'; // Limpiar atributos

    if (entityValue) {
        const entityId = entityValue.split('-')[1]; // Extraer el ID de la entidad
        const attributesContainer = document.getElementById(`attributes-container-${entityId}`);
        const attributes = attributesContainer.querySelectorAll('.attribute');

        attributes.forEach((attr, index) => {
            const attributeName = attr.querySelector('input[type="text"]').value;
            const attrOption = document.createElement('option');
            attrOption.value = `attribute-${entityId}-${index}`;
            attrOption.textContent = attributeName;
            attributeSelect.appendChild(attrOption);
        });
    }
}

// Función para comprobar si hay 2 o más entidades y mostrar el apartado de relaciones
function checkEntitiesForRelations() {
    const relationContainer = document.getElementById('relation-container');
    const entities = document.querySelectorAll('.entity');

    if (entities.length >= 2) {
        relationContainer.style.display = 'block';
    } else {
        relationContainer.style.display = 'none';
    }
}

// Función para generar el código SQL de la base de datos
function generateDatabase() {
    let sqlScript = '';

    for (let i = 1; i <= entityCount; i++) {
        const entityNameInput = document.getElementById(`entity-name-${i}`);
        if (!entityNameInput) continue;
        const entityName = entityNameInput.value.trim();

        if (!entityName) {
            alert('Por favor, nombra todas las entidades antes de generar el SQL.');
            return;
        }

        sqlScript += `CREATE TABLE ${entityName} (\n`;

        const attributesContainer = document.getElementById(`attributes-container-${i}`);
        const attributes = attributesContainer.querySelectorAll('.attribute');

        attributes.forEach((attr, index) => {
            const attributeName = attr.querySelector('input[type="text"]').value;
            const attributeType = attr.querySelector('select').value;
            const isPrimaryKey = attr.querySelector('input[type="checkbox"]').checked;
            sqlScript += `  ${attributeName} ${attributeType}${isPrimaryKey ? ' PRIMARY KEY' : ''}`;

            if (index < attributes.length - 1) {
                sqlScript += ',\n';
            }
        });

        sqlScript += '\n);\n\n';
    }

    // Generar relaciones (claves foráneas)
    relations.forEach(relation => {
        const entity1Name = document.getElementById(relation.entity1).querySelector('input').value;
        const entity2Name = document.getElementById(relation.entity2).querySelector('input').value;
        const attribute1Name = relation.attribute1.split('-')[2];
        const attribute2Name = relation.attribute2.split('-')[2];

        sqlScript += `ALTER TABLE ${entity2Name} ADD CONSTRAINT fk_${entity2Name}_${entity1Name} FOREIGN KEY (${attribute2Name}) REFERENCES ${entity1Name}(${attribute1Name});\n\n`;
    });

    // Actualiza el área de texto con el script SQL
    document.getElementById('sql-output').value = sqlScript;
}

// Función para descargar el script SQL generado
function downloadSQL() {
    const sqlScript = document.getElementById('sql-output').value;
    if (!sqlScript) {
        alert('No hay script SQL para descargar.');
        return;
    }

    const blob = new Blob([sqlScript], { type: 'text/sql' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'database_script.sql';
    link.click();
}

// Función para generar la documentación
function generateDocumentation() {
    let markdown = '# Documentación de la Base de Datos\n\n';
    
    for (let i = 1; i <= entityCount; i++) {
        const entityNameInput = document.getElementById(`entity-name-${i}`);
        if (!entityNameInput) continue;
        
        const entityName = entityNameInput.value.trim();
        if (!entityName) {
            alert('Por favor, nombra todas las entidades antes de generar la documentación.');
            return;
        }

        const attributesContainer = document.getElementById(`attributes-container-${i}`);
        const attributes = attributesContainer.querySelectorAll('.attribute');

        markdown += `## ${entityName}\n`;
        markdown += '| Atributo | Tipo |\n';
        markdown += '|----------|------|\n';

        attributes.forEach(attr => {
            const attributeName = attr.querySelector('input[type="text"]').value;
            const attributeType = attr.querySelector('select').value;
            const isPrimaryKey = attr.querySelector('input[type="checkbox"]').checked ? ' (PK)' : '';
            markdown += `| ${attributeName}${isPrimaryKey} | ${attributeType} |\n`;
        });

        markdown += '\n---\n\n';
    }

    // Actualiza el área de texto con el documento Markdown
    document.getElementById('documentation-output').value = markdown;
    alert('Documentación generada. Verifica el área de salida para el contenido en Markdown.');
}

// Función para descargar la documentación generada
function downloadDocumentation() {
    const markdown = document.getElementById('documentation-output').value;
    if (!markdown) {
        alert('No hay documentación para descargar.');
        return;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'documentacion.md';
    link.click();
}

// Función para limpiar todos los campos
function clearAll() {
    // Vaciar el contenedor de entidades
    document.getElementById('entities-container').innerHTML = '';
    
    // Vaciar las salidas de SQL y documentación
    document.getElementById('sql-output').value = '';
    document.getElementById('documentation-output').value = '';
    
    // Vaciar los selectores de relaciones
    const relationEntities = [document.getElementById('relation-entity-1'), document.getElementById('relation-entity-2')];
    relationEntities.forEach(select => {
        select.innerHTML = '<option value="">Seleccionar Entidad</option>'; // Restablecer a la opción predeterminada
    });

    const relationAttributes = [document.getElementById('relation-attribute-1'), document.getElementById('relation-attribute-2')];
    relationAttributes.forEach(select => {
        select.innerHTML = '<option value="">Seleccionar Atributo</option>'; // Restablecer a la opción predeterminada
    });

    // Reiniciar el conteo de entidades y relaciones
    entityCount = 0;
    relations = [];
    checkEntitiesForRelations();
}
