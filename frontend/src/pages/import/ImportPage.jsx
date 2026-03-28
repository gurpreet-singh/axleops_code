import { useState, useEffect, useCallback } from 'react';
import importService from '../../services/importService';
import './import.css';

const STEPS = [
  { key: 'entity', label: 'Select Entity', icon: 'fas fa-database' },
  { key: 'upload', label: 'Upload CSV', icon: 'fas fa-cloud-upload-alt' },
  { key: 'mapping', label: 'Map Columns', icon: 'fas fa-columns' },
  { key: 'review', label: 'Review', icon: 'fas fa-check-double' },
  { key: 'import', label: 'Import', icon: 'fas fa-file-import' },
];

export default function ImportPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [uploadData, setUploadData] = useState(null);
  const [mappings, setMappings] = useState({});
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Template state
  const [detectedTemplate, setDetectedTemplate] = useState(null);
  const [allTemplates, setAllTemplates] = useState([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateApplied, setTemplateApplied] = useState(false);

  // ─── Fetch entities on mount ────────────────────────────
  useEffect(() => {
    importService.getEntities()
      .then(res => setEntities(res.data))
      .catch(err => setError('Failed to load import entities'));
  }, []);

  // ─── Step Navigation ────────────────────────────────────
  const goToStep = useCallback((step) => {
    if (step <= currentStep) setCurrentStep(step);
  }, [currentStep]);

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  // ─── Step 1: Entity Selection ───────────────────────────
  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity);
  };

  // ─── Step 2: File Upload ────────────────────────────────
  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const res = await importService.uploadFile(file, selectedEntity.entityName);
      setUploadData(res.data);
      setSessionId(res.data.importSessionId);
      nextStep();

      // Auto-detect template
      try {
        const tmplRes = await importService.detectTemplate(res.data.importSessionId);
        setDetectedTemplate(tmplRes.data.matchedTemplate);
        setAllTemplates(tmplRes.data.allTemplates || []);

        if (tmplRes.data.matchedTemplate) {
          setMappings(tmplRes.data.matchedTemplate.mappings || {});
          setTemplateApplied(true);
        } else {
          // Auto-map
          const autoRes = await importService.autoMap(res.data.importSessionId);
          setMappings(autoRes.data || {});
        }
      } catch (e) {
        // If template detection fails, just auto-map
        const autoRes = await importService.autoMap(res.data.importSessionId);
        setMappings(autoRes.data || {});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Apply Mapping ──────────────────────────────
  const handleApplyMapping = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await importService.applyMapping(sessionId, mappings);
      setValidationResult(res.data);
      nextStep();
    } catch (err) {
      setError(err.response?.data?.message || 'Mapping failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Save Template ──────────────────────────────
  const handleSaveTemplate = async (templateName, setAsDefault) => {
    try {
      await importService.saveTemplate({
        entityName: selectedEntity.entityName,
        templateName,
        mappings,
        csvHeaders: uploadData.headers,
        setAsDefault,
      });
      setShowSaveTemplate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    }
  };

  // ─── Step 4: Inline Edit ───────────────────────────────
  const handleCellEdit = async (rowIndex, fieldName, newValue) => {
    try {
      const res = await importService.editRow(sessionId, rowIndex, { [fieldName]: newValue });
      // Update the validation result
      setValidationResult(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        const row = res.data;

        // Remove from old list, add to new
        updated.errorRows = updated.errorRows.filter(r => r.rowNumber !== row.rowNumber);
        updated.validRows = updated.validRows.filter(r => r.rowNumber !== row.rowNumber);
        updated.duplicateRows = updated.duplicateRows.filter(r => r.rowNumber !== row.rowNumber);

        if (row.status === 'VALID') {
          updated.validRows = [...updated.validRows, row].sort((a, b) => a.rowNumber - b.rowNumber);
          updated.validCount = updated.validRows.length;
        } else if (row.status === 'INVALID') {
          updated.errorRows = [...updated.errorRows, row].sort((a, b) => a.rowNumber - b.rowNumber);
        } else if (row.status === 'DUPLICATE') {
          updated.duplicateRows = [...updated.duplicateRows, row].sort((a, b) => a.rowNumber - b.rowNumber);
        }

        updated.errorCount = updated.errorRows.length;
        updated.duplicateCount = updated.duplicateRows.length;
        updated.validCount = updated.validRows.length;
        return updated;
      });
    } catch (err) {
      console.error('Cell edit failed:', err);
    }
  };

  // ─── Step 5: Execute Import ─────────────────────────────
  const handleExecuteImport = async (duplicateStrategy = 'SKIP') => {
    setLoading(true);
    setError(null);
    nextStep();
    try {
      const res = await importService.executeImport(sessionId, duplicateStrategy);
      setImportResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Export ─────────────────────────────────────────────
  const handleExportErrors = async () => {
    try {
      const res = await importService.exportErrors(sessionId);
      downloadBlob(res.data, 'import-errors.csv');
    } catch (err) { console.error(err); }
  };

  const handleExportDuplicates = async () => {
    try {
      const res = await importService.exportDuplicates(sessionId);
      downloadBlob(res.data, 'import-duplicates.csv');
    } catch (err) { console.error(err); }
  };

  const handleDownloadSample = async () => {
    try {
      const res = await importService.downloadSampleCsv(selectedEntity.entityName);
      downloadBlob(res.data, `${selectedEntity.entityName.toLowerCase()}-sample.csv`);
    } catch (err) { console.error(err); }
  };

  const downloadBlob = (data, filename) => {
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Reset ──────────────────────────────────────────────
  const resetWizard = () => {
    setCurrentStep(0);
    setSelectedEntity(null);
    setSessionId(null);
    setUploadData(null);
    setMappings({});
    setValidationResult(null);
    setImportResult(null);
    setDetectedTemplate(null);
    setAllTemplates([]);
    setTemplateApplied(false);
    setError(null);
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="import-wizard">
      {/* Step Progress Bar */}
      <div className="import-steps">
        {STEPS.map((step, idx) => (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`import-step-item ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
              onClick={() => goToStep(idx)}
            >
              <div className="import-step-number">
                {idx < currentStep ? <i className="fas fa-check" /> : idx + 1}
              </div>
              <span className="import-step-label">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`import-step-connector ${idx < currentStep ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ maxWidth: 900, margin: '0 auto 16px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, color: '#DC2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fas fa-exclamation-circle" />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}>
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="import-step-content">
        {currentStep === 0 && (
          <StepEntitySelector
            entities={entities}
            selected={selectedEntity}
            onSelect={handleEntitySelect}
            onDownloadSample={handleDownloadSample}
            onNext={() => { if (selectedEntity) nextStep(); }}
          />
        )}

        {currentStep === 1 && (
          <StepFileUploader
            entity={selectedEntity}
            onUpload={handleFileUpload}
            loading={loading}
            onBack={prevStep}
          />
        )}

        {currentStep === 2 && uploadData && (
          <StepColumnMapper
            uploadData={uploadData}
            entity={selectedEntity}
            mappings={mappings}
            onMappingsChange={setMappings}
            detectedTemplate={detectedTemplate}
            allTemplates={allTemplates}
            templateApplied={templateApplied}
            onApply={handleApplyMapping}
            onSaveTemplate={() => setShowSaveTemplate(true)}
            loading={loading}
            onBack={prevStep}
          />
        )}

        {currentStep === 3 && validationResult && (
          <StepValidationReview
            result={validationResult}
            entity={selectedEntity}
            onCellEdit={handleCellEdit}
            onExportErrors={handleExportErrors}
            onExportDuplicates={handleExportDuplicates}
            onExecute={handleExecuteImport}
            onBack={prevStep}
            onSaveTemplate={() => setShowSaveTemplate(true)}
            templateApplied={templateApplied}
          />
        )}

        {currentStep === 4 && (
          <StepImportExecution
            result={importResult}
            loading={loading}
            sessionId={sessionId}
            onReset={resetWizard}
          />
        )}
      </div>

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <SaveTemplateModal
          entityName={selectedEntity?.displayName}
          onSave={handleSaveTemplate}
          onClose={() => setShowSaveTemplate(false)}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// STEP 1: Entity Selector
// ═══════════════════════════════════════════════════════════════
function StepEntitySelector({ entities, selected, onSelect, onDownloadSample, onNext }) {
  return (
    <>
      <div className="entity-selector-header">
        <h2>What would you like to import?</h2>
        <p>Select an entity type to begin importing data from a CSV file</p>
      </div>

      <div className="wizard-actions">
        <div className="wizard-actions-left">
          {selected && (
            <button className="import-btn outline small" onClick={onDownloadSample}>
              <i className="fas fa-download" /> Download Sample CSV
            </button>
          )}
        </div>
        <div className="wizard-actions-right">
          <button className="import-btn primary" onClick={onNext} disabled={!selected}>
            Next: Upload CSV <i className="fas fa-arrow-right" />
          </button>
        </div>
      </div>

      <div className="entity-grid">
        {entities.map(entity => (
          <div
            key={entity.entityName}
            className={`entity-card ${selected?.entityName === entity.entityName ? 'selected' : ''}`}
            onClick={() => onSelect(entity)}
          >
            <div className="entity-card-icon">
              <i className={entity.icon || 'fas fa-table'} />
            </div>
            <h3>{entity.displayName}</h3>
            <p>{entity.description}</p>
            <div className="entity-card-meta">
              <span><i className="fas fa-asterisk" style={{ color: '#EF4444', fontSize: 8 }} /> {entity.requiredFieldCount} required</span>
              <span><i className="fas fa-list" style={{ fontSize: 10 }} /> {entity.totalFieldCount} fields</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="entity-fields-panel">
          <h3>
            <i className="fas fa-info-circle" style={{ color: '#6366F1' }} />
            Fields for {selected.displayName}
          </h3>
          <div className="field-list">
            {selected.fields.map(f => (
              <div key={f.fieldName} className="field-item">
                <span className={`field-badge ${f.required ? 'required' : 'optional'}`}>
                  {f.required ? 'REQ' : 'OPT'}
                </span>
                <span>{f.displayName}</span>
                <span className="field-badge type">{f.dataType}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}


// ═══════════════════════════════════════════════════════════════
// STEP 2: File Uploader
// ═══════════════════════════════════════════════════════════════
function StepFileUploader({ entity, onUpload, loading, onBack }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  };

  const handleFileInput = (e) => {
    const f = e.target.files[0];
    if (f) selectFile(f);
  };

  const selectFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx'].includes(ext)) {
      alert('Please upload a .csv or .xlsx file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }
    setFile(f);
  };

  const handleUpload = () => {
    if (file) onUpload(file);
  };

  return (
    <div className="upload-zone">
      <div className="entity-selector-header">
        <h2>Upload CSV for {entity?.displayName}</h2>
        <p>Drag and drop your file or click to browse</p>
      </div>

      <div className="wizard-actions">
        <div className="wizard-actions-left">
          <button className="import-btn outline" onClick={onBack}>
            <i className="fas fa-arrow-left" /> Back
          </button>
        </div>
        <div className="wizard-actions-right">
          <button className="import-btn primary" onClick={handleUpload} disabled={!file || loading}>
            {loading ? <><i className="fas fa-spinner fa-spin" /> Uploading...</> : <>Upload & Continue <i className="fas fa-arrow-right" /></>}
          </button>
        </div>
      </div>

      <div
        className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('csv-file-input').click()}
      >
        <input id="csv-file-input" type="file" accept=".csv,.xlsx" onChange={handleFileInput} style={{ display: 'none' }} />
        <div className="upload-icon">
          <i className="fas fa-cloud-upload-alt" />
        </div>
        {file ? (
          <>
            <h3><i className="fas fa-file-csv" style={{ color: '#10B981', marginRight: 8 }} />{file.name}</h3>
            <p>{(file.size / 1024).toFixed(1)} KB</p>
          </>
        ) : (
          <>
            <h3>Drop your CSV file here</h3>
            <p>or <span className="browse-link">browse</span> to select a file</p>
            <div className="upload-meta">
              <span><i className="fas fa-file" /> .csv, .xlsx</span>
              <span><i className="fas fa-weight" /> Max 10MB</span>
              <span><i className="fas fa-list-ol" /> Max 10,000 rows</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// STEP 3: Column Mapper
// ═══════════════════════════════════════════════════════════════
function StepColumnMapper({ uploadData, entity, mappings, onMappingsChange, detectedTemplate,
                            allTemplates, templateApplied, onApply, onSaveTemplate, loading, onBack }) {
  const systemFields = entity?.fields || [];

  const handleMappingChange = (csvHeader, systemField) => {
    onMappingsChange(prev => ({ ...prev, [csvHeader]: systemField }));
  };

  const loadTemplate = (template) => {
    if (template?.mappings) {
      onMappingsChange(template.mappings);
    }
  };

  // Find unmapped required fields
  const mappedSystemFields = new Set(Object.values(mappings).filter(v => v && v !== '__SKIP__'));
  const unmappedRequired = systemFields.filter(f => f.required && !mappedSystemFields.has(f.fieldName));

  // Preview data for each CSV column
  const getPreview = (header) => {
    if (!uploadData.previewRows || uploadData.previewRows.length === 0) return '';
    const vals = uploadData.previewRows
      .slice(0, 2)
      .map(r => r[header])
      .filter(Boolean);
    return vals.join(', ');
  };

  return (
    <div className="mapper-container">
      <div className="entity-selector-header">
        <h2>Map CSV Columns to System Fields</h2>
        <p>Match your CSV column headers to the corresponding system fields</p>
      </div>

      <div className="wizard-actions">
        <div className="wizard-actions-left">
          <button className="import-btn outline" onClick={onBack}>
            <i className="fas fa-arrow-left" /> Back
          </button>
          <button className="import-btn outline small" onClick={onSaveTemplate}>
            <i className="fas fa-save" /> Save Template
          </button>
        </div>
        <div className="wizard-actions-right">
          <button className="import-btn primary" onClick={onApply} disabled={loading || unmappedRequired.length > 0}>
            {loading ? <><i className="fas fa-spinner fa-spin" /> Validating...</> : <>Validate & Review <i className="fas fa-arrow-right" /></>}
          </button>
        </div>
      </div>

      {/* Template Banner */}
      {detectedTemplate && (
        <div className="template-banner matched">
          <span>
            <i className="fas fa-magic" />
            Template "<strong>{detectedTemplate.name}</strong>" auto-applied ({Math.round(detectedTemplate.matchPercentage)}% match)
          </span>
          <div className="banner-actions">
            <button className="import-btn outline small" onClick={onSaveTemplate}>Manage Templates</button>
          </div>
        </div>
      )}

      {!detectedTemplate && allTemplates.length === 0 && (
        <div className="template-banner no-match">
          <span><i className="fas fa-info-circle" /> First import — columns auto-mapped by name matching. Save a template after mapping for future imports.</span>
        </div>
      )}

      {/* Template Selector */}
      {allTemplates.length > 0 && (
        <div className="template-selector">
          <label>Load Template:</label>
          <select
            onChange={(e) => {
              const t = allTemplates.find(t => t.id === e.target.value);
              if (t) loadTemplate(t);
            }}
            defaultValue=""
          >
            <option value="">-- Select a saved template --</option>
            {allTemplates.map(t => (
              <option key={t.id} value={t.id}>
                {t.templateName} {t.isDefault ? '⭐' : ''} (used {t.useCount}x)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mapping Table */}
      <div className="mapping-table-wrap">
        <table className="mapping-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>CSV Column</th>
              <th style={{ width: '10%', textAlign: 'center' }}>→</th>
              <th style={{ width: '35%' }}>System Field</th>
              <th style={{ width: '20%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {uploadData.headers.map((header) => {
              const mapped = mappings[header];
              const isAuto = mapped && !templateApplied;
              const isTmpl = mapped && templateApplied;
              return (
                <tr key={header}>
                  <td>
                    <div className="csv-column-cell">
                      <span className="csv-column-name">{header}</span>
                      <span className="csv-column-preview">{getPreview(header)}</span>
                    </div>
                  </td>
                  <td className="mapping-arrow">→</td>
                  <td>
                    <select
                      className={`mapping-select ${isAuto ? 'auto-mapped' : ''} ${isTmpl ? 'template-mapped' : ''}`}
                      value={mapped || ''}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                    >
                      <option value="">-- Select field --</option>
                      <option value="__SKIP__">⏭ Skip this column</option>
                      {systemFields.map(f => (
                        <option key={f.fieldName} value={f.fieldName}>
                          {f.displayName} {f.required ? '*' : ''} ({f.dataType})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {isTmpl && <span style={{ fontSize: 11, color: '#3B82F6' }}>📋 Template</span>}
                    {isAuto && <span style={{ fontSize: 11, color: '#10B981' }}>✨ Auto-matched</span>}
                    {!mapped && <span style={{ fontSize: 11, color: '#94A3B8' }}>Unmapped</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Unmapped Required Warning */}
      {unmappedRequired.length > 0 && (
        <div className="unmapped-warning">
          <i className="fas fa-exclamation-triangle" />
          Required fields not mapped: {unmappedRequired.map(f => f.displayName).join(', ')}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// STEP 4: Validation Review
// ═══════════════════════════════════════════════════════════════
function StepValidationReview({ result, entity, onCellEdit, onExportErrors, onExportDuplicates,
                                onExecute, onBack, onSaveTemplate, templateApplied }) {
  const [activeTab, setActiveTab] = useState('valid');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [duplicateStrategy, setDuplicateStrategy] = useState('SKIP');

  const fieldNames = entity?.fields?.map(f => f.fieldName) || [];
  const fieldDisplayMap = {};
  entity?.fields?.forEach(f => { fieldDisplayMap[f.fieldName] = f.displayName; });

  const currentRows = activeTab === 'valid' ? result.validRows :
                      activeTab === 'errors' ? result.errorRows :
                      result.duplicateRows;

  const startEdit = (rowIndex, fieldName, currentValue) => {
    setEditingCell({ rowIndex, fieldName });
    setEditValue(currentValue || '');
  };

  const commitEdit = () => {
    if (editingCell) {
      onCellEdit(editingCell.rowIndex, editingCell.fieldName, editValue);
      setEditingCell(null);
    }
  };

  const getFieldErrors = (row, fieldName) => {
    return row.errors?.filter(e => e.fieldName === fieldName) || [];
  };

  return (
    <div className="validation-container">
      {/* Action Bar — always at top */}
      <div className="wizard-actions">
        <div className="wizard-actions-left">
          <button className="import-btn outline" onClick={onBack}>
            <i className="fas fa-arrow-left" /> Back to Mapping
          </button>
          {!templateApplied && (
            <button className="import-btn outline small" onClick={onSaveTemplate}>
              <i className="fas fa-save" /> Save Mapping Template
            </button>
          )}
          {result.errorCount > 0 && (
            <button className="import-btn outline small" onClick={onExportErrors}>
              <i className="fas fa-download" /> Export Errors
            </button>
          )}
          {result.duplicateCount > 0 && (
            <button className="import-btn outline small" onClick={onExportDuplicates}>
              <i className="fas fa-download" /> Export Duplicates
            </button>
          )}
        </div>
        <div className="wizard-actions-right">
          {result.duplicateCount > 0 && (
            <select value={duplicateStrategy} onChange={e => setDuplicateStrategy(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#475569' }}>
              <option value="SKIP">Skip duplicates</option>
              <option value="OVERWRITE">Overwrite existing</option>
              <option value="KEEP_BOTH">Import as new</option>
            </select>
          )}
          <button className="import-btn success" onClick={() => onExecute(duplicateStrategy)} disabled={result.validCount === 0}>
            <i className="fas fa-file-import" /> Import {result.validCount} Records
          </button>
        </div>
      </div>

      {/* Tabs — single source for counts */}
      <div className="validation-tabs">
        <button className={`validation-tab ${activeTab === 'valid' ? 'active' : ''}`} onClick={() => setActiveTab('valid')}>
          <span className="tab-status-dot green" />
          <i className="fas fa-check-circle" style={{ color: activeTab === 'valid' ? '#059669' : undefined }} /> Ready to Import
          <span className="tab-count green">{result.validCount}</span>
        </button>
        <button className={`validation-tab ${activeTab === 'errors' ? 'active' : ''}`} onClick={() => setActiveTab('errors')}>
          <span className={`tab-status-dot ${result.errorCount > 0 ? 'red' : 'gray'}`} />
          <i className="fas fa-exclamation-triangle" style={{ color: activeTab === 'errors' ? '#DC2626' : undefined }} /> Errors
          <span className={`tab-count ${result.errorCount > 0 ? 'red' : 'gray'}`}>{result.errorCount}</span>
        </button>
        <button className={`validation-tab ${activeTab === 'duplicates' ? 'active' : ''}`} onClick={() => setActiveTab('duplicates')}>
          <span className={`tab-status-dot ${result.duplicateCount > 0 ? 'orange' : 'gray'}`} />
          <i className="fas fa-clone" style={{ color: activeTab === 'duplicates' ? '#D97706' : undefined }} /> Duplicates
          <span className={`tab-count ${result.duplicateCount > 0 ? 'orange' : 'gray'}`}>{result.duplicateCount}</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="validation-table-wrap" style={{ maxHeight: 400, overflowY: 'auto' }}>
        <table className="validation-table">
          <thead>
            <tr>
              <th>#</th>
              {fieldNames.map(fn => (
                <th key={fn}>{fieldDisplayMap[fn] || fn}</th>
              ))}
              {activeTab === 'duplicates' && <th>Reason</th>}
            </tr>
          </thead>
          <tbody>
            {currentRows?.length === 0 && (
              <tr><td colSpan={fieldNames.length + 2} style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                No rows in this category
              </td></tr>
            )}
            {currentRows?.slice(0, 100).map((row, idx) => (
              <tr key={row.rowNumber}>
                <td style={{ fontWeight: 600, color: '#94A3B8' }}>{row.rowNumber}</td>
                {fieldNames.map(fn => {
                  const errors = getFieldErrors(row, fn);
                  const hasError = errors.length > 0;
                  const isEditing = editingCell?.rowIndex === idx && editingCell?.fieldName === fn;

                  return (
                    <td
                      key={fn}
                      className={`${hasError ? 'cell-error' : ''} ${activeTab === 'errors' ? 'cell-editable' : ''}`}
                      onClick={() => activeTab === 'errors' && startEdit(idx, fn, row.data[fn])}
                      title={hasError ? errors.map(e => e.message).join('; ') : ''}
                    >
                      {isEditing ? (
                        <input
                          className="cell-editable"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => e.key === 'Enter' && commitEdit()}
                          autoFocus
                        />
                      ) : (
                        <>
                          {row.data[fn] || '—'}
                          {hasError && (
                            <span style={{ marginLeft: 4, fontSize: 10, color: '#EF4444' }} title={errors[0]?.message}>
                              ⚠
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  );
                })}
                {activeTab === 'duplicates' && (
                  <td><span className="duplicate-reason">{row.duplicateReason}</span></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// STEP 5: Import Execution
// ═══════════════════════════════════════════════════════════════
function StepImportExecution({ result, loading, sessionId, onReset }) {
  if (loading && !result) {
    return (
      <div className="execution-container">
        <div className="progress-section">
          <div className="progress-icon importing">
            <i className="fas fa-cog fa-spin" />
          </div>
          <h3 style={{ margin: '0 0 8px', color: '#1E293B' }}>Importing Records...</h3>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>Please wait while we process your data</p>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="execution-container">
      <div className="import-summary">
        <div className="progress-icon completed" style={{ marginBottom: 16 }}>
          <i className="fas fa-check-circle" />
        </div>
        <h3 style={{ textAlign: 'center' }}>Import Complete!</h3>

        <div className="summary-stats">
          <div className="summary-stat imported">
            <span>✅ Records imported successfully</span>
            <span className="summary-stat-value">{result.importedRows}</span>
          </div>
          {result.errorRows > 0 && (
            <div className="summary-stat errors">
              <span>⚠️ Records skipped (errors)</span>
              <span className="summary-stat-value">{result.errorRows}</span>
            </div>
          )}
          {result.duplicateRows > 0 && (
            <div className="summary-stat duplicates">
              <span>🔁 Duplicate records</span>
              <span className="summary-stat-value">{result.duplicateRows}</span>
            </div>
          )}
          {result.overwrittenRows > 0 && (
            <div className="summary-stat overwritten">
              <span>📝 Records overwritten</span>
              <span className="summary-stat-value">{result.overwrittenRows}</span>
            </div>
          )}
          <div className="summary-stat" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <span style={{ color: '#475569' }}>Total rows processed</span>
            <span className="summary-stat-value" style={{ color: '#1E293B' }}>{result.totalRows}</span>
          </div>
        </div>

        <div className="summary-actions">
          <button className="import-btn primary" onClick={onReset}>
            <i className="fas fa-plus" /> Import Another File
          </button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// Save Template Modal
// ═══════════════════════════════════════════════════════════════
function SaveTemplateModal({ entityName, onSave, onClose }) {
  const [name, setName] = useState(`${entityName} - ${new Date().toLocaleDateString()}`);
  const [isDefault, setIsDefault] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3><i className="fas fa-save" style={{ color: '#6366F1', marginRight: 8 }} />Save Mapping Template</h3>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px' }}>
          Save this column mapping so future imports with the same CSV structure are automatically mapped.
        </p>
        <div className="form-group">
          <label>Template Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="checkbox-row">
          <input type="checkbox" id="set-default" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
          <label htmlFor="set-default" style={{ margin: 0, textTransform: 'none', fontSize: 13 }}>
            Set as default template for {entityName}
          </label>
        </div>
        <div className="modal-actions">
          <button className="import-btn outline" onClick={onClose}>Cancel</button>
          <button className="import-btn primary" onClick={() => onSave(name, isDefault)} disabled={!name.trim()}>
            <i className="fas fa-save" /> Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
